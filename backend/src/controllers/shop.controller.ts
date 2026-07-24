import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { initiateStkPush } from '../services/mpesa.service';
import cache from '../utils/cache';

const PRODUCTS_TTL = 60_000; // 60s — products rarely change
const ORDERS_TTL = 15_000;   // 15s — orders update more frequently

// GET /api/shop/products
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = cache.get<any[]>('shop:products');
    if (cached) return res.json({ success: true, data: cached, _cached: true });

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    cache.set('shop:products', data || [], PRODUCTS_TTL);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/shop/products
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, image_url, price, description, in_stock } = req.body;
    const { data, error } = await supabase
      .from('products')
      .insert([{ name, image_url, price: parseFloat(price), description, in_stock }])
      .select()
      .single();

    if (error) throw error;
    cache.invalidate('shop:products');
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/shop/products/:id
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, image_url, price, description, in_stock } = req.body;
    const { data, error } = await supabase
      .from('products')
      .update({ name, image_url, price: parseFloat(price), description, in_stock })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    cache.invalidate('shop:products');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/shop/products/:id
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    cache.invalidate('shop:products');
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/shop/checkout
export const checkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerName, phoneNumber, items, amount } = req.body;

    if (!customerName || !phoneNumber || !items || !amount) {
      return res.status(400).json({ error: 'Missing checkout requirements' });
    }

    const { data: order, error: orderError } = await supabase
      .from('shop_orders')
      .insert([{
        customer_name: customerName,
        phone_number: phoneNumber,
        items,
        amount: parseFloat(amount),
        payment_status: 'pending',
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    try {
      const stkResult = await initiateStkPush(
        phoneNumber,
        parseFloat(amount),
        `ORD-${order.id.substring(0, 5)}`,
        `Chess Store Order`
      );

      await supabase
        .from('shop_orders')
        .update({ checkout_request_id: stkResult.checkoutRequestId })
        .eq('id', order.id);

      // Bust orders cache so admin sees the new order quickly
      cache.invalidate('shop:orders');

      res.json({
        success: true,
        message: 'Checkout STK push initiated successfully.',
        checkoutRequestId: stkResult.checkoutRequestId,
      });
    } catch (stkError: any) {
      console.error('Checkout M-Pesa STK Push failed:', stkError.message);
      await supabase
        .from('shop_orders')
        .update({ payment_status: 'failed' })
        .eq('id', order.id);

      res.status(400).json({
        success: false,
        error: stkError.message || 'Failed to trigger payment STK Push. Order marked as failed.',
      });
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/shop/orders (Admin only)
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = cache.get<any[]>('shop:orders');
    if (cached) return res.json({ success: true, data: cached, _cached: true });

    const { data, error } = await supabase
      .from('shop_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    cache.set('shop:orders', data || [], ORDERS_TTL);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

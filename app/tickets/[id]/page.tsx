'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import Barcode from 'react-barcode';
import { Loader2, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

interface RegistrationData {
  id: string;
  ticket_number: string;
  player_name: string;
  amount: number;
  category: string;
  mpesa_receipt: string;
  created_at: string;
  tournaments: {
    name: string;
    event_date: string;
    venue: string;
  };
}

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiRequest(`/registrations/${id}`);
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError('Ticket not found or invalid.');
        }
      } catch (err) {
        setError('Network error loading ticket.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const downloadPDF = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const element = document.getElementById('printable-ticket');
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); 
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Jumuiya_Ticket_${data.ticket_number}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#6B4A34]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h1 className="text-2xl font-serif font-bold text-[#232320]">{error}</h1>
        <Link href="/" className="text-sm font-bold text-[#6B4A34] hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 flex flex-col items-center">
      <div className="max-w-5xl w-full flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#232320]">Your Event Ticket</h1>
          <p className="font-sans text-sm text-[#6B4A34] mb-1">Download and present this ticket at the venue.</p>
          <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>A copy of this ticket has been sent to your email.</span>
          </div>
        </div>
        <button
          onClick={downloadPDF}
          disabled={downloading}
          className="flex items-center space-x-2 bg-[#232320] text-white px-6 py-3 rounded-lg font-sans font-bold hover:bg-[#6B4A34] transition-colors disabled:opacity-70 shadow-md"
        >
          {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          <span>Download PDF Ticket</span>
        </button>
      </div>

      {/* TICKET WRAPPER (This is rendered to screen for preview, and captured for PDF) */}
      <div className="w-full max-w-[1000px] overflow-x-auto shadow-2xl rounded-xl bg-white border border-[#6B4A34]/20 p-2">
        
        {/* The actual element captured by html2canvas (explicitly sized to force a good PDF ratio) */}
        <div id="printable-ticket" className="w-[1000px] h-[400px] bg-white flex relative text-black overflow-hidden border-2 border-dashed border-[#6B4A34]/30">
          
          {/* PAID WATERMARK ON RECEIPT SIDE */}
          <div className="absolute left-10 top-20 flex items-center justify-center opacity-[0.03] pointer-events-none -rotate-12 z-0">
            <span className="text-[80px] font-bold tracking-widest uppercase">PAID</span>
          </div>

          {/* LEFT SIDE: RECEIPT */}
          <div className="w-[45%] h-full p-8 flex flex-col justify-between relative z-10 bg-[#FAF7F2]/50 border-r-2 border-dashed border-[#6B4A34]/40">
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <img src="/images/chess_logo.png" alt="Logo" className="w-16 h-16 object-contain" />
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#232320]">Jumuiya Chess</h2>
                  <p className="font-sans text-[10px] font-bold text-[#6B4A34] uppercase tracking-widest">Payment Receipt</p>
                </div>
              </div>
              
              <div className="space-y-4 font-sans text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold">Billed To</p>
                  <p className="font-bold text-lg text-[#232320]">{data.player_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold">Event</p>
                  <p className="font-semibold text-[#232320]">{data.tournaments.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-bold">M-Pesa Ref</p>
                    <p className="font-mono font-bold text-[#232320]">{data.mpesa_receipt}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-bold">Date Paid</p>
                    <p className="font-semibold text-[#232320]">{new Date(data.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-[#6B4A34] pt-4 mt-4 flex justify-between items-end">
              <p className="font-sans text-xs text-gray-500">Keep this portion for your records.</p>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-gray-500">Amount Paid</p>
                <p className="font-serif text-2xl font-bold text-[#232320]">KES {data.amount.toLocaleString()}</p>
              </div>
            </div>
            
            {/* Cut Line Indicator */}
            <div className="absolute right-[-15px] top-1/2 -translate-y-1/2 bg-white rounded-full p-1 border border-[#6B4A34]/20 shadow-sm z-20">
              <span className="text-lg" title="Cut Here">✂️</span>
            </div>
          </div>

          {/* RIGHT SIDE: TICKET */}
          <div className="w-[55%] h-full p-8 flex flex-col justify-between relative z-10 bg-white">
            
            <div className="flex justify-between items-start">
              <div>
                <p className="font-sans text-[10px] font-bold text-white bg-[#6B4A34] px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-3">Event Ticket</p>
                <h1 className="font-serif text-2xl font-black text-[#232320] leading-normal pb-1 mb-1 max-w-[300px] line-clamp-2">{data.tournaments.name}</h1>
                <p className="font-sans font-bold text-[#6B4A34] text-sm">Category: {data.category}</p>
              </div>
              <div className="text-right bg-[#FAF7F2] p-3 rounded-lg border border-[#6B4A34]/20">
                <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Ticket Number</p>
                <p className="font-mono font-bold text-lg text-[#232320]">{data.ticket_number}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 my-6 font-sans border-y border-gray-100 py-6">
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Player Name</p>
                <p className="font-bold text-xl text-[#232320] leading-normal pb-1 line-clamp-1">{data.player_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Date & Time</p>
                <p className="font-semibold text-[#232320] leading-normal pb-1 line-clamp-1">{new Date(data.tournaments.event_date).toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Venue</p>
                <p className="font-semibold text-[#232320]">{data.tournaments.venue}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-[10px] text-gray-400 font-sans max-w-[200px]">
                <p>Present this ticket at the registration desk upon arrival.</p>
                <p className="mt-1">Valid for one entry only.</p>
              </div>
              <div className="bg-white p-2 border-2 border-gray-100 rounded">
                <Barcode value={data.ticket_number || data.id} height={40} width={1.5} fontSize={12} background="#ffffff" lineColor="#232320" renderer="canvas" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

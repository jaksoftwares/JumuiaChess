import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function TournamentRulesPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center space-x-2 text-[#6B4A34] hover:underline font-bold font-sans text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-[#6B4A34]/10">
          <div className="flex items-center space-x-3 mb-6">
            <ShieldCheck className="w-10 h-10 text-[#6B4A34]" />
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#232320]">Tournament Policy</h1>
          </div>
          
          <div className="prose prose-stone max-w-none font-sans text-[#232320]/80">
            <p className="lead text-lg mb-8">Official rules and regulations governing all Jumuiya Chess Initiative events, adhering to FIDE and Chess Kenya standards.</p>
            
            <div className="space-y-6">
              <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#6B4A34]/20">
                <h3 className="flex items-center space-x-2 font-serif text-xl font-bold text-[#6B4A34] mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>1. FIDE & Chess Kenya Rules</span>
                </h3>
                <p className="text-sm leading-relaxed">
                  By registering, players agree to adhere strictly to official tournament rules, pairing criteria, and sportsmanship regulations governed by FIDE and Chess Kenya. All arbiters' decisions are final during rated matches.
                </p>
              </div>

              <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#6B4A34]/20">
                <h3 className="flex items-center space-x-2 font-serif text-xl font-bold text-[#6B4A34] mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>2. Electronic Devices & Fair Play</span>
                </h3>
                <p className="text-sm leading-relaxed">
                  Electronic devices, including mobile phones and smartwatches, must be completely powered off in the playing hall. Any unsportsmanlike conduct or cheating will result in immediate disqualification and removal without a fee refund.
                </p>
              </div>

              <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#6B4A34]/20">
                <h3 className="flex items-center space-x-2 font-serif text-xl font-bold text-[#6B4A34] mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>3. Entry Fee & Refunds</span>
                </h3>
                <p className="text-sm leading-relaxed">
                  Entry fees are processed securely via M-Pesa. Registration fees are non-refundable once pairings are published (usually 24 hours prior to the event), unless the tournament is cancelled by organizers. PWD/DAP entries are free.
                </p>
              </div>

              <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#6B4A34]/20">
                <h3 className="flex items-center space-x-2 font-serif text-xl font-bold text-[#6B4A34] mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>4. Arrival & Check-In</span>
                </h3>
                <p className="text-sm leading-relaxed">
                  Players are required to present their official Digital PDF Ticket or printed equivalent at the registration desk at least 30 minutes before round 1 begins. Late arrivals may forfeit the first round.
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

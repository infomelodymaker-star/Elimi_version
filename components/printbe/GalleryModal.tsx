'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { GalleryItem } from './types';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigureItem?: (title: string) => void;
}

const galleryItems: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Brand Packaging Box & Jar Set',
    category: 'Packaging',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5Ylj73groQ5L2TIDkZEVCZUo1JEM5oVBY-xwdq7pUCXZHxPqsjxqp1jbC8M6YPnDG3TdNQgm6sg-dC6VmAUrp28QC8BojveO1BwOgo6MD0t2L2ercosdgiKhS-U45WS7UnYTWxWzPPhghUwe5kSc9HwKYut32W1zKmd_AaGIWxbMnTY3yeFzvzSaS_SFU6eBR7r_ROe8zZtIPb5RL_bq7cl38QhmTc7IBHZ1Rqm9nxfWPC0ezMuHS',
    description: 'Custom soft-touch luxury skincare boxes with rose gold foil stamping.',
  },
  {
    id: 'g2',
    title: 'Executive Corporate Stationery Suite',
    category: 'Stationery',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmkMZDKFG7Vtk6n5FbbM8NhO4JPHW5WOWB7Ajr37ExAXk0L47VCa4aJgtymW63w-QvLVOETD4EsShOS4MP7sbcwDsDANzG9h3vLMRw9becoEUZZosJ0aD40mSMQ1NNhBO1kdB0QL9mNKD23IFHI4Fd0CJ-RyAUgUnqSI1OM28eV1b87nwQq8fvkutdrrWw9pGJZTBmDLd1BysdOfvr_zSnnIuyWTNCBkMY3vAxbvIV_Xj8FhG8Rvxm',
    description: 'Textured cotton paper business cards with blind debossing and gold gilded edges.',
  },
  {
    id: 'g3',
    title: 'Event Merchandise & Swag Collection',
    category: 'Promotional',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuihW_pUe9stC3071PxkFCybFiONj-Joq-OTe_GcElx3MEKgsREWjQjuImSsM2PcbMudIykONgtdXMM716DZ8Ru0dtfOPpYA-vjiB0te8iBBuiBzM3bhToAmIqf3VUbAXXLxhmFNOKGUZCUx8PT2tgok6FgBo652kvUN2Ci8UKa1vLEb-9NsrjpShyL631d6W_olAEswb5bw6VRgUYk9xdLaLqGHCypmw__8DXqOmvApifka6JgMpm',
    description: 'Laser-engraved thermal water bottles, notebooks, and ceramic mugs.',
  },
  {
    id: 'g4',
    title: 'Custom Screen Printed Apparel',
    category: 'Apparel',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhSvRw53ZDp7iCDW0qzgcTC09hwaqYUXfiIpp_DLl6N0zDLE-c1WIlH_ArA5fBIxiK7C9jCeJBC7VcLE76WfSrigue4Mx0NjdMROw_IvbkH6z0h_Zs2W7hsX11RqGsWkt_sVa_2rtj9Ka6vvx4tFXUlngoc-C9HAfe-yUSyi6Vt8TuHqD9G0etNHJG4WoBT3rgBxpbn3ATQ3zHo9ws-TkG-iw63hnMHF2HY2KDdqYwjycIXCw3NJeH',
    description: 'Full-color plastisol screen print on heavyweight streetwear hoodies and tees.',
  },
  {
    id: 'g5',
    title: 'Die-Cut Vinyl Brand Stickers',
    category: 'Packaging',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3XhonsnbmNqBU5ZHxI4jDDHP4imIuBeGpEHcFcvSZV1VmPx1IAj-4mdUwd3xHRZZSQSUcEv22wpYMAHTyq9PI66m4BTRmehEdrY6t5WQnIa_9TDgU90Acj6Lm-XtIwUaC2D81ijqW6K925j_w8WtAxQrxM2oeXMKe3RfZOgaVwMQX3hmzLJLS_ldY9eDj3thqB58igB4cxwD__PE-gUUckBu9j0wwd2LBQCsK_5sUnaFi8fuXPbvn',
    description: 'Heavy duty waterproof vinyl stickers with matte laminate UV shield.',
  },
  {
    id: 'g6',
    title: 'Tri-Fold Promotional Pamphlets',
    category: 'Stationery',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1LSbuSdsvyupryCiMxlCe552i3ij-ADw8v-M0OuJAOH_cLzgQb2ulAbNMVJwz4i_fMmRNmexjzY3psMJttD1kZDrxlb98fbluMeR59nsK7CgaO5sChvcpww2xZn4WFCvO5yX7ezQiMtA4mW7UT8hOXPCMYeh_Kaemg1fRQChUpk1k0BBmKpn0h92Phel052QytxWeTwvc_GZlg6HqBxrT_iHdqh3E3Z7twtFDp0uSIapUCFINBUuU',
    description: 'High gloss double-sided brochures printed on 100lb cover stock.',
  },
];

export default function GalleryModal({ isOpen, onClose, onConfigureItem }: GalleryModalProps) {
  const [selectedFilter, setSelectedFilter] = useState('All');

  if (!isOpen) return null;

  const filteredItems = selectedFilter === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === selectedFilter);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 text-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-800 p-6 md:p-8 relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
              <ImageIcon className="w-3.5 h-3.5" /> Print Be Portfolio Gallery
            </div>
            <h2 className="text-3xl font-extrabold text-white">Featured Print Work</h2>
            <p className="text-xs text-slate-400">Inspiration from recent corporate, retail, and custom print projects.</p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['All', 'Apparel', 'Stationery', 'Packaging', 'Promotional'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 flex flex-col justify-between group hover:border-indigo-500 transition-colors">
                <div>
                  <div className="h-48 rounded-xl overflow-hidden mb-4 bg-slate-950 flex items-center justify-center p-2">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">{item.category}</span>
                  <h3 className="font-bold text-sm text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.description}</p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onConfigureItem?.(item.title);
                  }}
                  className="w-full bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  Configure Similar <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}

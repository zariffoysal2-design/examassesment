import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface FinishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  solvedCount: number;
  totalProblems: number;
}

const FinishModal: React.FC<FinishModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  solvedCount,
  totalProblems,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition duration-150 p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Heading */}
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Finish Test Confirmation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to finish the test? You will not be able to submit additional solutions after finishing.
            </p>
          </div>
        </div>

        {/* Current Progress Summary */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span>Problems Solved:</span>
            <span className="font-bold text-emerald-400">{solvedCount} / {totalProblems}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${(solvedCount / totalProblems) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition duration-150 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-900/30 flex items-center space-x-1.5 transition duration-150 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Finish Test Now</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default FinishModal;

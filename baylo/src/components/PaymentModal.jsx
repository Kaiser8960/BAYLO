import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentModal = ({ isOpen, onClose, plan, onConfirmPayment, isLoading }) => {
  if (!isOpen || !plan) return null;

  // Get token allocation based on plan
  const tokenAmounts = {
    'Free Trial': 10,
    'Bai Plus': 150,
    'Bai Premium': 250
  };
  const tokenAmount = tokenAmounts[plan.name] || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-navy mb-4">Confirm Your Subscription</h2>
            <p className="text-gray-700 mb-6">
              You are about to subscribe to the <span className="font-semibold text-navy">{plan.name}</span> plan for{' '}
              <span className="font-bold text-navy">{plan.price}{plan.period && `/${plan.period}`}</span>.
            </p>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-navy mb-2">Plan Benefits:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {plan.features && plan.features.map((feature, index) => (
                  <li key={index}>{typeof feature === 'string' ? feature : feature.text}</li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="font-semibold text-navy">
                  Tokens upon subscription: <span className="text-purple-600">{tokenAmount} tokens</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={onConfirmPayment}
                className="px-6 py-3 bg-navy text-cream rounded-lg font-medium hover:bg-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;

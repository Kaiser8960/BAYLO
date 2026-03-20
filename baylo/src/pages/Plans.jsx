import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserProfile, updateSubscriptionPlan, addTokens } from '../firebase/firestore';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PaymentModal from '../components/PaymentModal';
import { useToast } from '../components/Toast';

const Plans = ({ user, profile: initialProfile, onSignOut, onProfileUpdate }) => {
  const { showSuccess, showError, ToastContainer } = useToast();
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(!initialProfile);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [selectedTokenPackage, setSelectedTokenPackage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        // Always fetch fresh profile from Firestore to ensure we have the latest data
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);
  
  // Update local profile when initialProfile prop changes
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  const handleSubscribeClick = (plan) => {
    setSelectedPlanForPayment(plan);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlanForPayment || !user) return;
    
    setIsProcessingPayment(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update subscription plan with token allocation
      const updatedProfile = await updateSubscriptionPlan(user.uid, selectedPlanForPayment.name);
      
      // Update local state
      setProfile(updatedProfile);
      
      // Update parent profile state (for Header token counter)
      if (onProfileUpdate) {
        await onProfileUpdate();
      }
      
      // Get token allocation amount
      const tokenAmounts = {
        'Free Trial': 10,
        'Bai Plus': 150,
        'Bai Premium': 250
      };
      const tokenAmount = tokenAmounts[selectedPlanForPayment.name] || 0;
      
      // Show success message with token info
      const isSwitching = profile?.plan !== selectedPlanForPayment.name;
      if (isSwitching) {
        showSuccess(`Successfully switched to ${selectedPlanForPayment.name}! ${tokenAmount} tokens allocated.`);
      } else {
        showSuccess(`Successfully subscribed to ${selectedPlanForPayment.name}! ${tokenAmount} tokens allocated.`);
      }
      
      // Close modal
      setIsPaymentModalOpen(false);
      setSelectedPlanForPayment(null);
      
    } catch (error) {
      console.error('Payment error:', error);
      showError('Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPlanForPayment(null);
  };

  const tokenPackages = [
    { id: 'tokens-50', tokens: 50, price: '₱50.00', popular: false },
    { id: 'tokens-100', tokens: 100, price: '₱90.00', popular: true },
    { id: 'tokens-200', tokens: 200, price: '₱170.00', popular: false },
    { id: 'tokens-500', tokens: 500, price: '₱400.00', popular: false }
  ];

  const handleTokenPurchaseClick = (tokenPackage) => {
    setSelectedTokenPackage(tokenPackage);
    setIsTokenModalOpen(true);
  };

  const handleConfirmTokenPurchase = async () => {
    if (!selectedTokenPackage || !user) return;
    
    setIsProcessingPayment(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add tokens to user's account
      const updatedProfile = await addTokens(user.uid, selectedTokenPackage.tokens);
      
      // Update local state
      setProfile(updatedProfile);
      
      // Update parent profile state (for Header token counter)
      if (onProfileUpdate) {
        await onProfileUpdate();
      }
      
      showSuccess(`Successfully purchased ${selectedTokenPackage.tokens} tokens!`);
      
      // Close modal
      setIsTokenModalOpen(false);
      setSelectedTokenPackage(null);
      
    } catch (error) {
      console.error('Token purchase error:', error);
      showError('Purchase failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCloseTokenModal = () => {
    setIsTokenModalOpen(false);
    setSelectedTokenPackage(null);
  };

  const canPurchaseTokens = profile?.plan === 'Bai Plus' || profile?.plan === 'Bai Premium';

  const plans = [
    {
      id: 'free-trial',
      name: 'Free Trial',
      description: 'The essentials to start your skill exchange journey.',
      price: '₱0',
      period: '',
      features: [
        { text: '2 skills to teach and 2 skills to learn', type: 'check' },
        { text: '10 tokens upon signup', type: 'check' },
        { text: '30 minute call limit per session', type: 'check' },
        { text: 'Can only give ratings and feedbacks', type: 'check' }
      ],
      popular: false,
      mostPopular: false
    },
    {
      id: 'bai-plus',
      name: 'Bai Plus',
      description: 'A plan that scales with your learning journey.',
      price: '₱149.00',
      period: '',
      features: [
        { text: '5 skills to teach and 5 skills to learn', type: 'check' },
        { text: 'Able to recharge tokens', type: 'check' },
        { text: '150 tokens upon subscription', type: 'check' },
        { text: 'Gain tokens after each session', type: 'check' },
        { text: 'Priority in search & recommendations', type: 'check' },
        { text: 'Earn XP bonus (+5 XP/session)', type: 'check' }
      ],
      popular: false,
      mostPopular: true
    },
    {
      id: 'bai-premium',
      name: 'Bai Premium',
      description: 'Dedicated features and support for serious learners.',
      price: '₱249.00',
      period: '',
      features: [
        { text: 'All Plus features', type: 'check' },
        { text: 'Custom Avatar Borders', type: 'check' },
        { text: 'Customizable profile with photos/certificates', type: 'check' },
        { text: '250 tokens upon subscription', type: 'check' },
        { text: 'Earn XP bonus (+10 XP/session)', type: 'check' },
        { text: 'Be able to take request sessions with people who are ranked in the leaderboards', type: 'check' }
      ],
      popular: true,
      mostPopular: false,
      sparkle: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white">
      <ToastContainer />
      <Header user={user} profile={profile} onSignOut={onSignOut} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto px-2 md:px-4 lg:px-8 py-4 md:py-6 lg:py-8 pb-20 lg:pb-8 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header Section */}
            <div className="text-center mb-6 md:mb-12">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-navy mb-3 md:mb-4">
                Pricing
              </h1>
            </div>

            {/* Token Store Section - Only for Bai Plus and Bai Premium */}
            {canPurchaseTokens && (
              <div className="mb-6 md:mb-12">
                <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-navy mb-4 md:mb-6 text-center">Token Store</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {tokenPackages.map((pkg) => (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className={`bg-white rounded-xl md:rounded-2xl shadow-lg border-2 p-4 md:p-5 lg:p-6 relative ${
                        pkg.popular ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-2 md:-top-3 left-1/2 transform -translate-x-1/2 bg-[#112250] text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-md">
                          Best Value
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-2 md:mb-3">{pkg.tokens}</div>
                        <div className="text-sm md:text-base text-gray-600 mb-2">Tokens</div>
                        <div className="text-lg md:text-2xl lg:text-3xl font-bold text-purple-600 mb-3 md:mb-4">{pkg.price}</div>
                        <button
                          onClick={() => handleTokenPurchaseClick(pkg)}
                          className="w-full py-2 md:py-2.5 px-4 md:px-5 bg-navy text-cream rounded-lg md:rounded-xl text-sm md:text-base font-medium hover:bg-navy-light transition-colors"
                        >
                          Purchase
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Plans List */}
            <ul className="product-plans">
              {plans.map((plan, index) => {
                const isCurrentPlan = plan.name === profile?.plan;
                
                return (
                  <li 
                    key={plan.id} 
                    className={`product-plan ${plan.sparkle ? 'sparkle-plan' : ''}`}
                    style={{
                      '--accent-color': plan.id === 'free-trial' 
                        ? '#112250' 
                        : 'linear-gradient(to right, #112250, #2952c3)'
                    }}
                  >
                    {plan.mostPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#112250] to-[#2952c3] text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg z-10">
                        Most Popular
                      </div>
                    )}
                    {plan.sparkle && (
                      <div className="sparkle-container">
                        <div className="sparkle sparkle-1">✨</div>
                        <div className="sparkle sparkle-2">✨</div>
                        <div className="sparkle sparkle-3">✨</div>
                        <div className="sparkle sparkle-4">✨</div>
                        <div className="sparkle sparkle-5">✨</div>
                        <div className="sparkle sparkle-6">✨</div>
                      </div>
                    )}
                    <h3 className="title">{plan.name}</h3>
                    <div 
                      className="price" 
                      style={{
                        background: plan.id === 'free-trial' 
                          ? '#112250' 
                          : 'linear-gradient(to right, #112250, #2952c3)'
                      }}
                    >
                      {plan.price}{plan.period && `/${plan.period}`}
                    </div>
                    
                    <ul className="features">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className={feature.type === 'check' ? 'check' : 'cross'}>
                          {feature.text}
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      className="btn"
                      onClick={() => !isCurrentPlan && handleSubscribeClick(plan)}
                      disabled={isCurrentPlan}
                      style={{
                        background: plan.id === 'free-trial' 
                          ? '#112250' 
                          : 'linear-gradient(to right, #112250, #2952c3)'
                      }}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Buy plan'}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </main>
      </div>

      {/* Payment Modal for Plans */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        plan={selectedPlanForPayment}
        onConfirmPayment={handleConfirmPayment}
        isLoading={isProcessingPayment}
      />

      {/* Payment Modal for Token Purchases */}
      {selectedTokenPackage && (
        <PaymentModal
          isOpen={isTokenModalOpen}
          onClose={handleCloseTokenModal}
          plan={{
            name: `${selectedTokenPackage.tokens} Tokens`,
            price: selectedTokenPackage.price,
            features: [
              { text: `${selectedTokenPackage.tokens} tokens will be added to your account`, type: 'check' }
            ]
          }}
          onConfirmPayment={handleConfirmTokenPurchase}
          isLoading={isProcessingPayment}
        />
      )}
    </div>
  );
};

export default Plans;

import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="w-full flex flex-col bg-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gray-50 pt-20 pb-24 border-b border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            Optimize Your Facility's <span className="text-[#FE5C00]">Energy Performance</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            The Oklahoma State University Industrial Training and Assessment Center (ITAC) provides 
            no-cost energy, productivity, and waste assessments to small and medium-sized manufacturers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
                to="/signup" 
                className="w-full sm:w-auto bg-[#FE5C00] text-white font-bold text-lg px-8 py-4 rounded-lg shadow-md hover:bg-orange-700 hover:shadow-lg transition-all"
            >
              Apply for an Assessment
            </Link>
            <Link 
                to="/login" 
                className="w-full sm:w-auto bg-white text-gray-800 border border-gray-300 font-bold text-lg px-8 py-4 rounded-lg hover:bg-gray-50 transition-all"
            >
              Client Login
            </Link>
          </div>
        </div>
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-40 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl"></div>
            <div className="absolute top-48 -left-24 w-72 h-72 bg-blue-50 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* 2. WHY ENERGY SAVINGS MATTER */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Prioritize Energy Efficiency?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Reducing energy consumption isn't just about sustainability - it is a direct investment in your bottom line and operational resilience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<IconTrendingDown />}
              title="Reduce Operating Costs"
              description="Lowering your monthly utility bills frees up critical capital that can be reinvested into workforce development, new equipment, and facility expansion."
            />
            <FeatureCard 
              icon={<IconShield />}
              title="Extend Equipment Lifespan"
              description="Identifying inefficiencies, fixing leaks, and optimizing motor loads reduces wear and tear, dramatically extending the life of your heavy machinery."
            />
            <FeatureCard 
              icon={<IconLeaf />}
              title="Achieve Compliance"
              description="Stay ahead of shifting environmental regulations and meet corporate sustainability goals by reducing your facility's carbon footprint."
            />
          </div>
        </div>
      </section>

      {/* 3. WHAT WE DO: THE 3-TIERED MODEL & SAVINGS */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">How ITAC Saves You Money</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              We utilize a comprehensive, 3-tiered industrial assessment model to uncover hidden waste. 
              Starting with a Tier 1 data analysis of your utility bills, moving to a Tier 2 remote/hybrid evaluation, 
              and culminating in a full Tier 3 onsite physical audit conducted by our engineering faculty and student researchers.
            </p>
            
            <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-[#FE5C00] font-bold text-lg mb-2 flex items-center gap-2">
                    <IconChart /> Real-World Impact
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                    Our targeted recommendations yield immediate financial returns. For example, a recent assessment of a facility's 
                    <strong> compressed air systems</strong> identified massive leakages and pressure drops. 
                </p>
                <div className="flex gap-6 border-t border-white/10 pt-4">
                    <div>
                        <div className="text-2xl font-black text-white">$14,200</div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Annual Savings</div>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white">4 Mo.</div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">ROI Payback</div>
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-6">
            <StepCard 
                number="01" 
                title="Apply & Upload Data" 
                description="Create an account and securely upload your facility details and recent utility bills to our portal." 
            />
            <StepCard 
                number="02" 
                title="Onsite Assessment" 
                description="Our team visits your plant to measure equipment performance, lighting, HVAC, and compressed air systems." 
            />
            <StepCard 
                number="03" 
                title="Actionable Reporting" 
                description="Receive a detailed, confidential report outlining specific recommendations, implementation costs, and exact payback periods." 
            />
          </div>

        </div>
      </section>

      {/* 4. ABOUT ITAC & FOOTER CTA */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About the Center</h2>
          <p className="text-gray-600 mb-10 leading-relaxed">
            Funded by the U.S. Department of Energy, the Great Plains Center of Excellence ITAC at Oklahoma State University 
            not only helps manufacturers reduce costs, but also serves as a premier training ground for the next generation 
            of energy engineers and industrial researchers.
          </p>
          <Link 
            to="/signup" 
            className="inline-block bg-[#FE5C00] text-white font-bold text-lg px-10 py-4 rounded-lg shadow-md hover:bg-orange-700 transition-all"
          >
            Start Your Assessment Application
          </Link>
        </div>
      </section>

    </div>
  );
};

/* --- UI SUB-COMPONENTS --- */

const FeatureCard = ({ icon, title, description }: any) => (
  <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
    <div className="w-14 h-14 bg-orange-100 text-[#FE5C00] rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }: any) => (
  <div className="flex gap-6 p-6 bg-gray-800 rounded-2xl border border-gray-700 hover:border-gray-600 transition-colors">
    <div className="text-4xl font-black text-[#FE5C00] opacity-50">{number}</div>
    <div>
        <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

/* --- SVGs --- */

const IconTrendingDown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
    </svg>
);

const IconShield = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const IconLeaf = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const IconChart = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

export default Home;
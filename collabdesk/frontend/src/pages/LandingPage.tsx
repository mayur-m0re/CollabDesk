import { useEffect, useRef } from 'react'
import { ArrowRight, CheckCircle, Zap, Users, Shield, BarChart3, FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate hero elements on load
    const hero = heroRef.current
    if (hero) {
      const elements = hero.querySelectorAll('.animate-on-load')
      elements.forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('animate-in')
        }, i * 100)
      })
    }
  }, [])

  const navigateTo = (path: string) => {
    window.location.href = path
  }

  const features = [
    {
      icon: Zap,
      title: 'Real-time Sync',
      description: 'Changes appear instantly for everyone on your team.'
    },
    {
      icon: FolderKanban,
      title: 'Smart Tasks',
      description: 'Auto-assign, set due dates, and manage dependencies.'
    },
    {
      icon: Users,
      title: 'Team Presence',
      description: 'See who\'s online and what they\'re working on.'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Track velocity, workload, and project progress.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SSO, audit logs, and granular permissions.'
    },
    {
      icon: CheckCircle,
      title: 'Fast Docs',
      description: 'Write, comment, and publish in minutes.'
    }
  ]

  const testimonials = [
    {
      quote: "CollabDesk cut our meeting load in half and made handoffs actually enjoyable.",
      author: "Ava Martinez",
      role: "Product Lead at Northwind"
    },
    {
      quote: "The best project management tool we've ever used. Simple yet powerful.",
      author: "Marcus Chen",
      role: "Engineering Manager at TechCorp"
    },
    {
      quote: "Finally, a tool that our whole team actually wants to use.",
      author: "Sarah Johnson",
      role: "CEO at StartupXYZ"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FolderKanban className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl">CollabDesk</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate hover:text-ink transition-colors">Features</a>
            <a href="#testimonials" className="text-sm font-medium text-slate hover:text-ink transition-colors">Testimonials</a>
            <a href="#pricing" className="text-sm font-medium text-slate hover:text-ink transition-colors">Pricing</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigateTo('/login')}>Sign in</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => navigateTo('/register')}>Get started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="min-h-screen bg-primary relative overflow-hidden flex items-center"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl leading-tight mb-6 animate-on-load opacity-0 translate-y-8 transition-all duration-700">
                WORK<br />TOGETHER
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-lg animate-on-load opacity-0 translate-y-8 transition-all duration-700 delay-100">
                The project workspace that keeps your team in sync—tasks, docs, and chat in one place.
              </p>
              <div className="flex flex-wrap gap-4 animate-on-load opacity-0 translate-y-8 transition-all duration-700 delay-200">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white gap-2" onClick={() => navigateTo('/register')}>
                  Get started free
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  See how it works
                </Button>
              </div>
              
              <div className="mt-12 flex items-center gap-6 animate-on-load opacity-0 translate-y-8 transition-all duration-700 delay-300">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className="w-10 h-10 rounded-full bg-white/20 border-2 border-primary flex items-center justify-center text-sm font-medium"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-white/70 text-sm">
                  Trusted by <span className="text-white font-semibold">10,000+</span> teams
                </p>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="hidden lg:block animate-on-load opacity-0 translate-x-12 transition-all duration-1000 delay-300">
              <div className="bg-white rounded-3xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="space-y-3">
                  <div className="h-8 bg-surface rounded-lg w-3/4" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-24 bg-surface rounded-xl" />
                    <div className="h-24 bg-surface rounded-xl" />
                    <div className="h-24 bg-surface rounded-xl" />
                  </div>
                  <div className="h-40 bg-surface rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-10 bg-surface rounded-lg" />
                    <div className="h-10 bg-surface rounded-lg" />
                    <div className="h-10 bg-surface rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              Everything you need to ship faster
            </h2>
            <p className="text-lg text-slate max-w-2xl mx-auto">
              Powerful features that help your team stay organized, communicate better, and deliver projects on time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-8 rounded-3xl bg-surface hover:bg-primary/5 transition-colors group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <feature.icon className="w-6 h-6 text-primary group-hover:text-white" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-slate">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Collaboration Section */}
      <section className="py-24 bg-primary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
                LIVE COLLABORATION
              </h2>
              <p className="text-xl text-white/80 mb-8">
                See who's viewing what. Comment, assign, and decide—without leaving the page.
              </p>
              <ul className="space-y-4">
                {[
                  'Real-time cursor tracking',
                  'Inline comments and discussions',
                  'Instant notifications',
                  '@mentions for quick tagging'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                    JD
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-surface rounded w-24 mb-1" />
                    <div className="h-2 bg-surface rounded w-16" />
                  </div>
                  <div className="px-3 py-1 bg-success/20 text-success text-xs rounded-full">
                    Online
                  </div>
                </div>
                <div className="h-px bg-border" />
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs">
                      AS
                    </div>
                    <div className="flex-1 bg-surface rounded-xl p-3">
                      <p className="text-sm">Working on the dashboard design. Looking good!</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-warning flex items-center justify-center text-white text-xs">
                      MK
                    </div>
                    <div className="flex-1 bg-surface rounded-xl p-3">
                      <p className="text-sm">Can you review the API changes?</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              Loved by teams worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl shadow-sm">
                <div className="text-accent text-4xl font-serif mb-4">"</div>
                <p className="text-lg mb-6">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-slate">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-slate">
              Start free, upgrade when you need more.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 'Free',
                description: 'For small teams getting started.',
                features: ['Up to 5 team members', '3 projects', 'Basic analytics', 'Community support']
              },
              {
                name: 'Pro',
                price: '$12',
                description: 'For growing teams who need speed.',
                features: ['Unlimited members', 'Unlimited projects', 'Advanced analytics', 'Priority support', 'Custom integrations'],
                popular: true
              },
              {
                name: 'Business',
                price: '$24',
                description: 'For orgs that need control.',
                features: ['Everything in Pro', 'SSO & SAML', 'Audit logs', 'Dedicated support', 'SLA guarantee']
              }
            ].map((plan, index) => (
              <div 
                key={index} 
                className={`p-8 rounded-3xl ${plan.popular ? 'bg-primary text-white shadow-glow' : 'bg-surface'}`}
              >
                {plan.popular && (
                  <div className="inline-block px-3 py-1 bg-accent text-white text-xs font-medium rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display font-bold text-xl mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-display font-bold text-4xl">{plan.price}</span>
                  {plan.price !== 'Free' && <span className="text-sm opacity-70">/user/mo</span>}
                </div>
                <p className={`text-sm mb-6 ${plan.popular ? 'text-white/80' : 'text-slate'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 ${plan.popular ? 'text-accent' : 'text-primary'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-white text-primary hover:bg-white/90' : 'bg-primary text-white hover:bg-primary/90'}`}
                  onClick={() => navigateTo('/register')}
                >
                  Get started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
            READY WHEN YOU ARE
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Start free. Invite your team. Ship something great this week.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white gap-2" onClick={() => navigateTo('/register')}>
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10"
            >
              Talk to sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-ink text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FolderKanban className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-xl">CollabDesk</span>
              </div>
              <p className="text-white/60 text-sm">
                The project workspace that keeps your team in sync.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API Reference</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40">
              © 2024 CollabDesk. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white/40 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="#" className="text-white/40 hover:text-white">
                <span className="sr-only">GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.261.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

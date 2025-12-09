import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowRight, BarChart3, Mail, Users, Zap, Shield, TrendingUp } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 md:py-32 bg-gradient-to-b from-background to-secondary/20">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-6">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                AI-Powered Lead Generation
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
                Transform leads into <span className="text-primary">revenue</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
                Intelligent lead management and email tracking that helps sales teams close deals faster with
                data-driven insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" asChild className="text-lg">
                  <Link href="/dashboard">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg bg-transparent">
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 border-y bg-card">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-primary">3.5x</div>
                <div className="text-muted-foreground">Higher conversion rates</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-primary">87%</div>
                <div className="text-muted-foreground">Email open rate</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-primary">2hrs</div>
                <div className="text-muted-foreground">Saved per day</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-balance">Everything you need to scale</h2>
              <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
                Powerful features designed for modern sales teams
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Client Management</CardTitle>
                  <CardDescription>Organize and track all your leads in one centralized dashboard</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Email Tracking</CardTitle>
                  <CardDescription>
                    Real-time notifications when prospects open and engage with your emails
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>
                    Comprehensive insights into campaign performance and conversion metrics
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>AI-Powered Insights</CardTitle>
                  <CardDescription>Machine learning algorithms predict the best time to reach out</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Enterprise Security</CardTitle>
                  <CardDescription>Bank-level encryption and compliance with industry standards</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Performance Reports</CardTitle>
                  <CardDescription>Automated weekly reports with actionable recommendations</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-4xl text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-balance">Ready to accelerate your sales?</h2>
            <p className="text-xl text-primary-foreground/90 text-pretty leading-relaxed">
              Join thousands of sales teams already using LeadSite AI to close more deals.
            </p>
            <div className="pt-4">
              <Button size="lg" variant="secondary" asChild className="text-lg">
                <Link href="/dashboard">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

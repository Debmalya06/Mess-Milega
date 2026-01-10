"use client"

import { Link } from "react-router-dom"
import { MapPin, Filter, MessageSquare, Sparkles, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const Home = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const features = [
    {
      icon: <Sparkles className="h-12 w-12 text-purple-600" />,
      title: "Smart Recommendations",
      description: "Our AI suggests the best PGs for you based on your preferences, saving you time and effort.",
    },
    {
      icon: <MessageSquare className="h-12 w-12 text-purple-600" />,
      title: "Review Summaries",
      description: "Get AI-generated summaries of user reviews, highlighting the pros and cons of each PG.",
    },
    {
      icon: <MapPin className="h-12 w-12 text-purple-600" />,
      title: "Interactive Map",
      description: "Visualize PG and mess locations on an interactive map to easily see what's near your college.",
    },
    {
      icon: <Filter className="h-12 w-12 text-purple-600" />,
      title: "Advanced Filtering",
      description: "Narrow down your search with advanced filters like commute time, amenities, and price range.",
    },
  ]

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Engineering Student",
      college: "IIT Delhi",
      rating: 5,
      text: "PGFinderAI made my accommodation search so much easier! The AI recommendations were spot-on and I found my perfect PG within days.",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Rahul Kumar",
      role: "MBA Student",
      college: "IIM Bangalore",
      rating: 5,
      text: "The review summaries feature is amazing. I could quickly understand the pros and cons of each PG without reading hundreds of reviews.",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Ananya Patel",
      role: "Medical Student",
      college: "AIIMS Mumbai",
      rating: 5,
      text: "The interactive map helped me find PGs close to my college with good transport connectivity. Highly recommend this platform!",
      avatar: "/placeholder.svg?height=60&width=60",
    },
  ]

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Find your perfect <span className="text-purple-600">student home</span>{" "}
                <span className="text-purple-600">with AI.</span>
              </h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                Say goodbye to endless scrolling. Our AI-powered platform helps you find the best PGs and messes near
                your college, tailored to your needs.
              </p>

              {/* Search Form */}
              <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter college, locality or address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>Budget</option>
                      <option>Under ₹5,000</option>
                      <option>₹5,000 - ₹10,000</option>
                      <option>₹10,000 - ₹15,000</option>
                      <option>Above ₹15,000</option>
                    </select>
                    <select className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Co-ed</option>
                    </select>
                  </div>
                  <Link
                    to="/search"
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-center block"
                  >
                    Search PGs
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:pl-12">
              <div className="bg-gray-100 rounded-2xl h-96 flex items-center justify-center">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Student accommodation illustration"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose PGFinderAI Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose PGFinderAI?</h2>
            <p className="text-xl text-gray-600">
              We leverage cutting-edge AI to make your PG search smarter, faster, and stress-free.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">10,000+</div>
              <div className="text-gray-600 font-medium">Properties Listed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">50,000+</div>
              <div className="text-gray-600 font-medium">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600 font-medium">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">4.8/5</div>
              <div className="text-gray-600 font-medium">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Students Say</h2>
            <p className="text-xl text-gray-600">
              Hear from students who found their perfect accommodation with PGFinderAI
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg">
              <div className="flex items-center justify-center mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>

              <blockquote className="text-xl md:text-2xl text-gray-700 text-center mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </blockquote>

              <div className="flex items-center justify-center space-x-4">
                <img
                  src={testimonials[currentTestimonial].avatar || "/placeholder.svg"}
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full"
                />
                <div className="text-center">
                  <div className="font-semibold text-gray-900 text-lg">{testimonials[currentTestimonial].name}</div>
                  <div className="text-gray-600">{testimonials[currentTestimonial].role}</div>
                  <div className="text-purple-600 font-medium">{testimonials[currentTestimonial].college}</div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? "bg-purple-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Perfect Student Home?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Join thousands of students who found their ideal accommodation with AI-powered recommendations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/search"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
            >
              Start Your Search
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors text-lg"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
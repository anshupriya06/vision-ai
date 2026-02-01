import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Here you would send the form data to your backend
      console.log('Form submitted:', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gradient mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Have questions or want to learn more about VisionSafe? We'd love to hear from you!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-8">
            {/* Email */}
            <div className="glassmorphism p-6 rounded-xl hover:scale-105 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Email</h3>
                  <p className="text-gray-400">support@visionsafe.io</p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="glassmorphism p-6 rounded-xl hover:scale-105 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Phone</h3>
                  <p className="text-gray-400">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="glassmorphism p-6 rounded-xl hover:scale-105 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Location</h3>
                  <p className="text-gray-400">San Francisco, CA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="glassmorphism p-8 rounded-xl">
              {submitted && (
                <div className="mb-6 p-4 bg-safe/20 border border-safe rounded-lg">
                  <p className="text-safe font-semibold">Message sent successfully! We'll get back to you soon.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-white font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-accent/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-white font-semibold mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-accent/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-white font-semibold mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-accent/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                    placeholder="What is this about?"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-white font-semibold mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 bg-slate-800 border border-accent/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors resize-none"
                    placeholder="Your message here..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full group relative px-8 py-4 bg-accent text-white font-semibold rounded-xl overflow-hidden hover:shadow-lg hover:shadow-accent/50 transition-all"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-accent to-safe transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                  <span className="relative">Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glassmorphism p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-accent mb-3">How does VisionSafe work?</h3>
              <p className="text-gray-400">VisionSafe uses advanced AI and computer vision to analyze video feeds in real-time, detecting suspicious activities and potential threats instantly.</p>
            </div>
            <div className="glassmorphism p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-accent mb-3">Is my data secure?</h3>
              <p className="text-gray-400">Yes! We use enterprise-grade encryption and follow all security best practices to ensure your data remains private and secure.</p>
            </div>
            <div className="glassmorphism p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-accent mb-3">What cameras are supported?</h3>
              <p className="text-gray-400">VisionSafe supports most IP cameras and can integrate with existing surveillance infrastructure in your organization.</p>
            </div>
            <div className="glassmorphism p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-accent mb-3">How can I get started?</h3>
              <p className="text-gray-400">Contact our sales team for a demo or free trial. We'll help you set up and configure VisionSafe for your needs.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

import React, { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({ email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    // which would then send the email to medconnect@gmail.com
    setSubmitted(true);
    // Reset form after submission
    setForm({ email: "", message: "" });
  };

  return (
    <div className="container mx-auto max-w-lg p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">Contact Us</h2>
      <p className="mb-6 text-gray-600">
        Have a question or feedback? Fill out the form below and we'll get back to you at your email address. Your message will be sent to <span className="font-medium">medconnect@gmail.com</span>.
      </p>
      {submitted ? (
        <div className="text-green-600 font-medium mb-4">
          Thank you for reaching out! We will get back to you soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Your Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="message">
              Your Query
            </label>
            <textarea
              name="message"
              id="message"
              required
              value={form.message}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Type your message here..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
};

export default Contact;
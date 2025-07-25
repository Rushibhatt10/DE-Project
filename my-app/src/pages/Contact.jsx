import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-4 py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Contact Form */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
          <form className="space-y-5">
            <div>
              <label className="block mb-1">Name</label>
              <input type="text" className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your name" />
            </div>
            <div>
              <label className="block mb-1">Email</label>
              <input type="email" className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block mb-1">Subject</label>
              <input type="text" className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Reason for contact" />
            </div>
            <div>
              <label className="block mb-1">Message</label>
              <textarea className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" rows="5" placeholder="Your message"></textarea>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all">Send Message</button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
          <div className="flex items-center gap-4">
            <Mail className="text-blue-600" />
            <p>support@yourapp.com</p>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="text-blue-600" />
            <p>+91-9876543210</p>
          </div>
          <div className="flex items-center gap-4">
            <MapPin className="text-blue-600" />
            <p>Gujarat Technological University, Ahmedabad, India</p>
          </div>

          {/* Socials */}
          <div className="flex gap-5 mt-6">
            <a href="#" className="text-blue-600 hover:text-blue-800 transition"><Instagram /></a>
            <a href="#" className="text-blue-600 hover:text-blue-800 transition"><Facebook /></a>
            <a href="#" className="text-blue-600 hover:text-blue-800 transition"><Linkedin /></a>
          </div>

          {/* Map Embed */}
          <div className="mt-10">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.9756954976123!2d72.54980491488543!3d23.02420292127619!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84fce5d46f6f%3A0x5abddbe365b56d8a!2sGujarat%20Technological%20University!5e0!3m2!1sen!2sin!4v1631176751094!5m2!1sen!2sin"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

import React from "react";
import { FaTwitter } from "react-icons/fa6";
import { FaLinkedin, FaGithub, FaInstagramSquare } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1333] text-white border-t border-purple-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Quizzii
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-md">
              Transform your content into engaging quizzes in seconds. Perfect
              for educators, students, and content creators.
            </p>
            <div className="flex gap-4">
              {/* Social Media Icons */}
              {[
                { name: "Twitter", icon: <FaTwitter />, url: "#" },
                {
                  name: "LinkedIn",
                  icon: <FaLinkedin />,
                  url: "https://www.linkedin.com/in/priyanshi-maurya-87141a2a4/",
                },
                {
                  name: "GitHub",
                  icon: <FaGithub />,
                  url: "https://github.com/princi-2306/",
                },
                { name: "Instagram", icon: <FaInstagramSquare />, url: "#" },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  className="w-10 h-10 bg-purple-900/50 rounded-lg flex items-center justify-center hover:bg-purple-700 transition-colors duration-200 text-lg"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-purple-300">
              Product
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Features", href: "#" },
                { name: "Pricing", href: "#" },
                { name: "Use Cases", href: "#" },
                { name: "API", href: "#" },
                { name: "Integrations", href: "#" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-purple-300 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-purple-300">
              Resources
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Documentation", href: "#" },
                { name: "Help Center", href: "#" },
                { name: "Blog", href: "#" },
                { name: "Tutorials", href: "#" },
                { name: "Community", href: "#" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-purple-300 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-purple-300">
              Company
            </h3>
            <ul className="space-y-3">
              {[
                { name: "About Us", href: "#" },
                { name: "Careers", href: "#" },
                { name: "Contact", href: "#" },
                { name: "Privacy Policy", href: "#" },
                { name: "Terms of Service", href: "#" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-purple-300 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-purple-900/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} Quizzii. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-sm">
            <a
              href="#"
              className="text-gray-500 hover:text-purple-300 transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-purple-300 transition-colors duration-200"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-purple-300 transition-colors duration-200"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

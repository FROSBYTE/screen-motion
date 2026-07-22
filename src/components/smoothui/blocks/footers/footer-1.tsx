"use client";

import { FooterSimple } from "@/components/ui/smoothui/footer-1";

export default function Footer1() {
  return (
    <FooterSimple
      companyName="screen-motion"
      description="The fastest way for product creators to design studio-quality 4K 3D promotional videos directly in the browser."
      copyright={`© ${new Date().getFullYear()} screen-motion. All rights reserved.`}
      links={{
        product: [
          { name: "3D Editor", url: "/editor" },
          { name: "Templates", url: "#templates" },
          { name: "Features", url: "#templates" },
        ],
        company: [
          { name: "About", url: "#" },
          { name: "Blog", url: "#" },
          { name: "Careers", url: "#" },
        ],
        support: [
          { name: "Documentation", url: "#" },
          { name: "Help Center", url: "#" },
          { name: "Status", url: "#" },
        ],
      }}
    />
  );
}

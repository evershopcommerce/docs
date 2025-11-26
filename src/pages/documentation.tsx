import React from "react";
import Layout from "@theme/Layout";

function WelcomeSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="mb-6 text-5xl md:text-6xl">
          Welcome to EverShop Documentation
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Everything you need to build, customize, and scale your e-commerce
          platform with EverShop. From getting started to advanced
          customization.
        </p>
        <div
          onClick={() => {
            const searchButton = document.querySelector(".DocSearch-Button");
            if (searchButton instanceof HTMLElement) {
              searchButton.click();
            }
          }}
          className="cursor-pointer flex justify-start items-center gap-3 max-w-md mx-auto p-2 bg-gray-100 rounded-md border-gray-300 border">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-search w-4 h-4 text-muted-foreground"
            aria-hidden="true">
            <path d="m21 21-4.34-4.34" />
            <circle cx={11} cy={11} r={8} />
          </svg>
          <span className="cursor-pointer">Search documentation...</span>
        </div>
      </div>
    </section>
  );
}

function GettingStartedCard() {
  const items = [
    {
      title: "Introduction",
      link: "/docs/development/getting-started/introduction",
    },
    {
      title: "Configuration Guide",
      link: "/docs/development/knowledge-base/configuration-guide",
    },
    {
      title: "Installation & Setup",
      link: "/docs/development/getting-started/installation-guide",
    },
    {
      title: "Project Structure",
      link: "/docs/development/knowledge-base/architecture-overview",
    },
    {
      title: "CLI Reference",
      link: "/docs/development/knowledge-base/command-lines",
    },
    { title: "Core Concepts", link: "/docs/development/knowledge-base" },
  ];
  return (
    <section className="container mx-auto px-4 pb-16">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-3 text-4xl">Start Your Journey</h1>
          <p className="text-muted-foreground text-lg">
            Master the fundamentals of EverShop. From installation to
            deployment, learn everything you need to build a successful online
            store.
          </p>
        </div>
        <div
          data-slot="card"
          className="text-card-foreground flex flex-col gap-6 rounded-xl group transition-all duration-300 hover:shadow-xl border-2 hover:border-primary/30 bg-black/5">
          <div
            data-slot="card-header"
            className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 pb-4">
            <div className="flex items-start gap-6">
              <div className="p-4 rounded-xl bg-black/80 text-primary-foreground shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-rocket w-8 h-8"
                  aria-hidden="true">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 data-slot="card-title" className="leading-none mb-3">
                  Getting Started with EverShop
                </h4>
                <p
                  data-slot="card-description"
                  className="text-muted-foreground text-base">
                  Your comprehensive guide to building a modern e-commerce
                  platform. Learn the fundamentals, installation process, and
                  core concepts to get your store up and running.
                </p>
              </div>
            </div>
          </div>
          <div
            data-slot="card-content"
            className="px-6 [&:last-child]:pb-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((item) => (
                <div className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-circle-check w-5 h-5 text-black/80 flex-shrink-0 mt-0.5"
                    aria-hidden="true">
                    <circle cx={12} cy={12} r={10} />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <a
                    className="text-gray-600 hover:text-black"
                    href={item.link}>
                    {item.title}
                  </a>
                </div>
              ))}
            </div>
            <a
              href="/docs/development/getting-started/installation-guide"
              data-slot="button"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-black/80 text-white hover:text-white hover:bg-black/70 h-9 px-4 py-2 has-[>svg]:px-3 w-full md:w-auto group/btn cursor-pointer">
              Start Learning
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-right w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1"
                aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CustomizationSection() {
  const cards = [
    {
      title: "API Reference",
      links: [
        { text: "REST API", link: "/docs/api/overview" },
        { text: "GraphQL API", link: "/docs/development/knowledge-base/graphql" }
      ],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-code-xml w-5 h-5 text-black/80"
          aria-hidden="true">
          <path d="m18 16 4-4-4-4" />
          <path d="m6 8-4 4 4 4" />
          <path d="m14.5 4-5 16" />
        </svg>
      ),
      description:
        "Comprehensive API documentation for building and extending your store with powerful REST and GraphQL APIs.",
    },
    {
      title: "Theme Development",
      links: [
        { text: "Theme Overview", link: "/docs/development/theme" },
        { text: "Components Reference", link: "/docs/development/theme/components" }
      ],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-palette w-5 h-5 text-black/80"
          aria-hidden="true">
          <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        </svg>
      ),
      description:
        "Create beautiful, responsive themes for your e-commerce store using our flexible theming system and components.",
    },
    {
      title: "Extension Development",
      links: [
        { text: "Module Overview", link: "/docs/development/module" },
        { text: "Function Reference", link: "/docs/development/module/functions" }
      ],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-puzzle w-5 h-5 text-black/80"
          aria-hidden="true">
          <path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z" />
        </svg>
      ),
      description:
        "Build powerful custom extensions to add new features and enhance your EverShop store's functionality effortlessly.",
    },
  ];
  return (
    <section className="container mx-auto px-4 pb-16">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-3 text-4xl">Customize Your Store</h1>
          <p className="text-muted-foreground text-lg">
            Unlock the full potential of EverShop. Build custom APIs, design
            unique themes, and create powerful extensions tailored to your
            business needs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              data-slot="card"
              className="bg-card text-card-foreground flex flex-col gap-3 rounded-xl border group transition-all duration-300 hover:shadow-lg hover:border-primary/50 h-full">
              <div
                data-slot="card-header"
                className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 pb-3">
                <div className="p-2.5 rounded-lg bg-black/5 group-hover:bg-black/10 transition-colors w-fit mb-3 flex items-center justify-center">
                  {card.icon}
                </div>
                <h4 data-slot="card-title" className="text-lg mb-0">
                  {card.title}
                </h4>
              </div>
              <div
                data-slot="card-content"
                className="px-6 [&:last-child]:pb-6">
                <p
                  data-slot="card-description"
                  className="text-muted-foreground mb-4">
                  {card.description}
                </p>
                <div className="flex flex-col gap-3">
                  {card.links.map((item) => (
                    <div className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-circle-check w-5 h-5 text-black/80 flex-shrink-0 mt-0.5"
                        aria-hidden="true">
                        <circle cx={12} cy={12} r={10} />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <a
                        className="text-black/80 hover:text-black"
                        href={item.link}>
                        {item.text}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketplaceSection() {
  return (
    <section className="container mx-auto px-4 pb-16">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border-2 border-black/20">
          <div className="absolute inset-0 bg-grid-black/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="relative p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/10 border border-black/20 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-package w-4 h-4 text-black/80"
                    aria-hidden="true">
                    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
                    <path d="M12 22V12" />
                    <polyline points="3.29 7 12 12 20.71 7" />
                    <path d="m7.5 4.27 9 5.15" />
                  </svg>
                  <span className="text-black">Marketplace</span>
                </div>
                <h2 className="mb-4 text-xl">Extensions &amp; Themes</h2>
                <p className="text-muted-foreground mb-6">
                  Discover ready-made extensions and beautiful themes to enhance
                  your store. Browse our marketplace for payment gateways,
                  shipping methods, marketing tools, and premium themes.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="/extensions"
                    data-slot="button"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-black text-white hover:text-white hover:bg-black/90 h-9 px-4 py-2 has-[>svg]:px-3 cursor-pointer">
                    Browse Extensions
                  </a>
                  <a
                    href="/extensions?tags=theme"
                    data-slot="button"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-white text-black hover:text-black hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 cursor-pointer">
                    Explore Themes
                  </a>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-background/50 backdrop-blur-sm transition-all hover:bg-black/5 hover:border-black/30 hover:shadow-md">
                    <div className="p-2 rounded-md bg-black/10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-credit-card w-4 h-4 text-black"
                        aria-hidden="true">
                        <rect width={20} height={14} x={2} y={5} rx={2} />
                        <line x1={2} x2={22} y1={10} y2={10} />
                      </svg>
                    </div>
                    <span className="text-foreground">Payment Gateways</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-background/50 backdrop-blur-sm transition-all hover:bg-black/5 hover:border-black/30 hover:shadow-md">
                    <div className="p-2 rounded-md bg-black/10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-truck w-4 h-4 text-black"
                        aria-hidden="true">
                        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                        <path d="M15 18H9" />
                        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                        <circle cx={17} cy={18} r={2} />
                        <circle cx={7} cy={18} r={2} />
                      </svg>
                    </div>
                    <span className="text-foreground">Shipping Methods</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-background/50 backdrop-blur-sm transition-all hover:bg-black/5 hover:border-black/30 hover:shadow-md">
                    <div className="p-2 rounded-md bg-black/10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-mail w-4 h-4 text-black"
                        aria-hidden="true">
                        <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                        <rect x={2} y={4} width={20} height={16} rx={2} />
                      </svg>
                    </div>
                    <span className="text-foreground">Email Marketing</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-background/50 backdrop-blur-sm transition-all hover:bg-black/5 hover:border-black/30 hover:shadow-md">
                    <div className="p-2 rounded-md bg-black/10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-megaphone w-4 h-4 text-black"
                        aria-hidden="true">
                        <path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
                        <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14" />
                        <path d="M8 6v8" />
                      </svg>
                    </div>
                    <span className="text-foreground">SEO &amp; Marketing</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-background/50 backdrop-blur-sm transition-all hover:bg-black/5 hover:border-black/30 hover:shadow-md">
                    <div className="p-2 rounded-md bg-black/10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-chart-column w-4 h-4 text-black"
                        aria-hidden="true">
                        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                        <path d="M18 17V9" />
                        <path d="M13 17V5" />
                        <path d="M8 17v-3" />
                      </svg>
                    </div>
                    <span className="text-foreground">Analytics</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-background/50 backdrop-blur-sm transition-all hover:bg-black/5 hover:border-black/30 hover:shadow-md">
                    <div className="p-2 rounded-md bg-black/10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-shopping-cart w-4 h-4 text-black"
                        aria-hidden="true">
                        <circle cx={8} cy={21} r={1} />
                        <circle cx={19} cy={21} r={1} />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                      </svg>
                    </div>
                    <span className="text-foreground">Sales Tools</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span
                    data-slot="badge"
                    className="inline-flex items-center justify-center rounded-md border text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 px-3 py-1">
                    Modern Themes
                  </span>
                  <span
                    data-slot="badge"
                    className="inline-flex items-center justify-center rounded-md border text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 px-3 py-1">
                    Industry Templates
                  </span>
                  <span
                    data-slot="badge"
                    className="inline-flex items-center justify-center rounded-md border text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 px-3 py-1">
                    Admin Tools
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DocumentationPage() {
  return (
    <Layout
      title="Documentation - EverShop"
      description="Comprehensive guides and documentation to help you start working with EverShop as quickly as possible."
      wrapperClassName="documentation">
      <main className="flex flex-col gap-16">
        <WelcomeSection />
        <GettingStartedCard />
        <CustomizationSection />
        <MarketplaceSection />
      </main>
    </Layout>
  );
}

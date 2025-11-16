import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import HomepageWebDevFeatures from "@site/src/components/HomepageWebDevFeatures";
import Separator from "../components/Separator";
import BorderBlock from "../components/BorderBlock";
import Card from "../components/Card";
import BlockHead from "../components/BlockHead";
import StreamLineProductControl from "../components/Animations/StreamLineProductControl";
import Category from "../components/Animations/Category";
import Collection from "../components/Animations/Collection";
import HeroBannerOne from "../components/HeroBannerOne";
import FadeInOutSlides from "../components/Animations/FadeInOutSlides";
import HeroBannerTwo from "../components/HeroBannerTwo";
import IntegrationLogos from "../components/Animations/IntegrationLogos";
import CheckoutExperience from "../components/Animations/CheckoutExperience";
import PaymentIntegration from "../components/Animations/PaymentIntegration";
import OrderManagement from "../components/Animations/OrderManagement";
import ThemeExtension from "../components/Animations/ThemeExtension";
import ThemeExtensionButtons from "../components/Animations/ThemeExtensionButtons";
import DataFetching from "../components/Animations/Coding";
import Builder from "../components/Animations/BuilderSVG";

function HomepageHeader() {
  return (
    <header className="hero hero--primary text-center">
      <div className="container text-center">
        <div className="flex justify-center">
          <div className="flex justify-center gap-3 text-primary font-medium bg-primary-02 max-w-fit p-1 pr-2 rounded-[16px] text-sm leading-5">
            <div className="flex justify-center gap-[3px] bg-white rounded-[16px] px-2 py-[2px]">
              <div className="flex justify-center items-center">
                <img
                  alt="Version"
                  src="/img/glowing-star.png"
                  width={18}
                  height={18}
                />
              </div>
              <span>Version 2.1</span>
            </div>
            <div className="flex gap-[5px] items-center justify-center">
              <a
                href="https://github.com/evershopcommerce/evershop"
                target="_blank"
                rel="noopener noreferrer">
                Check out the repo
              </a>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3.33301 8.00016H12.6663M12.6663 8.00016L7.99967 3.3335M12.6663 8.00016L7.99967 12.6668"
                  stroke="#008060"
                  stroke-width="1.3333"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <h1 className="hero__title mb-3 max-w-screen-lg">
            Your All-in-One open source ecommerce solution
          </h1>
        </div>
        <div className="flex items-center justify-center">
          <p className="text-lg md:text-xl text-center text-slate-500 mb-10">
            <p className="mb-0 max-w-3xl font-normal">
              Open-source, built on TypeScript, and designed for flexibility.
              Easily scale, customize, and manage your online store with
              powerful commerce features
            </p>
          </p>
        </div>
        <div className="grid gap-5 grid-cols-2">
          <div className="flex justify-end">
            <Link
              className="button button--secondary rounded-xl button--large"
              to="https://demo.evershop.io/"
              rel="nofollow">
              Explore our demo
            </Link>
          </div>
          <div className="flex justify-start">
            <Link
              className="button button--primary rounded-xl button--large"
              to="/docs/development/getting-started/introduction">
              <span className="flex items-center">
                <span>Get started</span>{" "}
                <span className="pl-2 flex justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="23"
                    height="22"
                    viewBox="0 0 23 22"
                    fill="none">
                    <path
                      d="M4.16699 11H18.8337M18.8337 11L13.3337 5.5M18.8337 11L13.3337 16.5"
                      stroke="white"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </Link>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:space-y-0 justify-center mt-16 min-w-[90%]">
          <div className="flex justify-center hero-image w-full">
            <FadeInOutSlides
              slides={[
                {
                  id: 1,
                  content: HeroBannerOne,
                },
                {
                  id: 2,
                  content: HeroBannerTwo,
                },
              ]}
              loop={false}
              full={true}
              interval={100000}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function Logos() {
  return (
    <div className="container">
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-14 py-10">
        <div className="flex justify-center items-center h-5 md:h-8">
          <img
            alt="EverShop and Stripe"
            src="/img/stripe-logo.webp"
            className="max-h-full max-w-fit w-auto"
            width={240}
            height={100}
          />
        </div>
        <div className="flex justify-center items-center h-5 md:h-8">
          <img
            alt="EverShop and Paypal"
            src="/img/paypal-logo.webp"
            className="max-h-full max-w-fit w-auto"
            width={382}
            height={100}
          />
        </div>
        <div className="flex justify-center items-center h-5 md:h-8">
          <img
            alt="EverShop and Algolia"
            src="/img/algolia-logo.webp"
            className="max-h-full max-w-fit w-auto"
            width={405}
            height={100}
          />
        </div>
        <div className="flex justify-center items-center h-5 md:h-8">
          <img
            alt="EverShop and Klarna"
            src="/img/klarna-logo.webp"
            className="max-h-full max-w-fit w-auto"
            width={414}
            height={100}
          />
        </div>
        <div className="flex justify-center items-center h-5 md:h-8">
          <img
            alt="EverShop and Netlify"
            src="/img/netlify-logo.webp"
            className="max-h-full max-w-fit w-auto"
            width={246}
            height={100}
          />
        </div>
        <div className="flex justify-center items-center h-5 md:h-8">
          <img
            alt="EverShop and Mailchimp"
            src="/img/mailchimp-logo.webp"
            className="max-h-full max-w-fit w-auto"
            width={214}
            height={100}
          />
        </div>
      </div>
    </div>
  );
}

function DynamicWidgets() {
  return (
    <div className="container">
      <div>
        <BlockHead
          label="Dynamic Widgets"
          heading={{
            className: "",
            text: "Maximize store performance with customizable content blocks",
          }}
          subheading={{
            className: "max-w-[760px]",
            text: "Personalize your storefront and optimize user experience by leveraging powerful widgets for effortless content management and navigation.",
          }}
        />
        <BorderBlock backgroundColor={"#fff"}>
          <Card
            className={"overflow-hidden"}
            backgroundColor={
              "radial-gradient(73% 56% at 96% 69%, #27b4874d 0%, #ffffff00 100%), radial-gradient(50% 50% at 0% 100%, #645EE51F 0%, #F8F9FAff 100%)"
            }>
            <Builder />
          </Card>
        </BorderBlock>
      </div>
    </div>
  );
}

function CatalogManagement() {
  return (
    <div className="container">
      <div>
        <BlockHead
          label="Catalog Management"
          heading={{
            className: "",
            text: "Simplify product management",
          }}
          subheading={{
            className: "max-w-[730px]",
            text: "Easily manage, categorize, and showcase your products with intuitive tools for enhanced shopping experiences.",
          }}
        />
        <BorderBlock backgroundColor={"#fff"}>
          <Card backgroundColor={"#F8F9FA"} className={"mb-6"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 overflow-hidden">
              <div className="order-2 md:order-1 flex flex-col justify-center pl-5 pt-5 pb-5 lg:pb-0 lg:pl-12 lg:pt-9">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none">
                  <path
                    d="M25.7736 7.57345L17.4136 3.06679C16.5336 2.58679 15.4669 2.58679 14.5869 3.06679L6.2269 7.57345C5.61357 7.90679 5.24023 8.54679 5.24023 9.28012C5.24023 10.0001 5.61357 10.6535 6.2269 10.9868L14.5869 15.4935C15.0269 15.7335 15.5202 15.8535 16.0002 15.8535C16.4802 15.8535 16.9736 15.7335 17.4136 15.4935L25.7736 10.9868C26.3869 10.6535 26.7602 10.0135 26.7602 9.28012C26.7602 8.54679 26.3869 7.90679 25.7736 7.57345Z"
                    fill="#008060"
                  />
                  <path
                    d="M13.2137 17.0533L5.42699 13.1599C4.82699 12.8666 4.13366 12.8933 3.57366 13.2399C3.00033 13.5999 2.66699 14.1999 2.66699 14.8666V22.2133C2.66699 23.4799 3.37366 24.6266 4.50699 25.1999L12.2803 29.0933C12.547 29.2266 12.8403 29.2933 13.1337 29.2933C13.4803 29.2933 13.827 29.1999 14.1337 29.0133C14.707 28.6666 15.0403 28.0533 15.0403 27.3866V20.0399C15.0537 18.7599 14.347 17.6133 13.2137 17.0533Z"
                    fill="#008060"
                  />
                  <path
                    d="M28.4266 13.2399C27.8533 12.8933 27.16 12.8533 26.5733 13.1599L18.8 17.0533C17.6666 17.6266 16.96 18.7599 16.96 20.0399V27.3866C16.96 28.0533 17.2933 28.6666 17.8666 29.0133C18.1733 29.1999 18.52 29.2933 18.8666 29.2933C19.16 29.2933 19.4533 29.2266 19.72 29.0933L27.4933 25.1999C28.6266 24.6266 29.3333 23.4933 29.3333 22.2133V14.8666C29.3333 14.1999 29 13.5999 28.4266 13.2399Z"
                    fill="#008060"
                  />
                </svg>
                <h5 className="mt-4 mb-3">Streamline Product Control</h5>
                <div>
                  Effortlessly manage, organize, and update your products with
                  intuitive tools and detailed insights.
                </div>
              </div>
              <div className="pt-16 md:pt-20 order-1 md:order-2">
                <StreamLineProductControl />
              </div>
            </div>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              backgroundColor={
                "radial-gradient(80% 50% at 100% 0%, #27b4874d 0%, #F8F9FAff 100%)"
              }>
              <div className="pl-5 pt-5 pb-5 lg:pl-12 lg:pt-12 lg:pb-12">
                <div className="w-full flex justify-start rounded-2xl">
                  <Category />
                </div>
                <div className="flex flex-col justify-center pt-8 lg:pt-12 pr-5 lg:pr-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none">
                    <path
                      d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.19C2 19.83 4.17 22 7.81 22H16.19C19.83 22 22 19.83 22 16.19V7.81C22 4.17 19.83 2 16.19 2ZM9.97 14.9L7.72 17.15C7.57 17.3 7.38 17.37 7.19 17.37C7 17.37 6.8 17.3 6.66 17.15L5.91 16.4C5.61 16.11 5.61 15.63 5.91 15.34C6.2 15.05 6.67 15.05 6.97 15.34L7.19 15.56L8.91 13.84C9.2 13.55 9.67 13.55 9.97 13.84C10.26 14.13 10.26 14.61 9.97 14.9ZM9.97 7.9L7.72 10.15C7.57 10.3 7.38 10.37 7.19 10.37C7 10.37 6.8 10.3 6.66 10.15L5.91 9.4C5.61 9.11 5.61 8.63 5.91 8.34C6.2 8.05 6.67 8.05 6.97 8.34L7.19 8.56L8.91 6.84C9.2 6.55 9.67 6.55 9.97 6.84C10.26 7.13 10.26 7.61 9.97 7.9ZM17.56 16.62H12.31C11.9 16.62 11.56 16.28 11.56 15.87C11.56 15.46 11.9 15.12 12.31 15.12H17.56C17.98 15.12 18.31 15.46 18.31 15.87C18.31 16.28 17.98 16.62 17.56 16.62ZM17.56 9.62H12.31C11.9 9.62 11.56 9.28 11.56 8.87C11.56 8.46 11.9 8.12 12.31 8.12H17.56C17.98 8.12 18.31 8.46 18.31 8.87C18.31 9.28 17.98 9.62 17.56 9.62Z"
                      fill="#008060"
                    />
                  </svg>
                  <div className="mt-3 mb-2 text-xl font-semibold text-Neutrals-01">
                    Efficient Category Organization
                  </div>
                  <div>
                    Create, edit, and organize product categories for intuitive
                    navigation and enhanced user experience.
                  </div>
                </div>
              </div>
            </Card>
            <Card
              backgroundColor={
                "radial-gradient(80% 50% at 100% 0%, #645EE51F 0%, #F8F9FAff 100%)"
              }>
              <div className="pl-5 lg:pl-12 overflow-hidden">
                <div className="w-full flex justify-start pt-5 lg:pt-12">
                  <Collection />
                </div>
                <div className="flex flex-col justify-center pt-8 lg:pt-12 pb-5 pr-5 lg:pr-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none">
                    <path
                      d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.19C2 19.83 4.17 22 7.81 22H16.19C19.83 22 22 19.83 22 16.19V7.81C22 4.17 19.83 2 16.19 2ZM9.97 14.9L7.72 17.15C7.57 17.3 7.38 17.37 7.19 17.37C7 17.37 6.8 17.3 6.66 17.15L5.91 16.4C5.61 16.11 5.61 15.63 5.91 15.34C6.2 15.05 6.67 15.05 6.97 15.34L7.19 15.56L8.91 13.84C9.2 13.55 9.67 13.55 9.97 13.84C10.26 14.13 10.26 14.61 9.97 14.9ZM9.97 7.9L7.72 10.15C7.57 10.3 7.38 10.37 7.19 10.37C7 10.37 6.8 10.3 6.66 10.15L5.91 9.4C5.61 9.11 5.61 8.63 5.91 8.34C6.2 8.05 6.67 8.05 6.97 8.34L7.19 8.56L8.91 6.84C9.2 6.55 9.67 6.55 9.97 6.84C10.26 7.13 10.26 7.61 9.97 7.9ZM17.56 16.62H12.31C11.9 16.62 11.56 16.28 11.56 15.87C11.56 15.46 11.9 15.12 12.31 15.12H17.56C17.98 15.12 18.31 15.46 18.31 15.87C18.31 16.28 17.98 16.62 17.56 16.62ZM17.56 9.62H12.31C11.9 9.62 11.56 9.28 11.56 8.87C11.56 8.46 11.9 8.12 12.31 8.12H17.56C17.98 8.12 18.31 8.46 18.31 8.87C18.31 9.28 17.98 9.62 17.56 9.62Z"
                      fill="#008060"
                    />
                  </svg>
                  <div className="mt-3 mb-2 text-xl font-semibold text-Neutrals-01">
                    Showcase Product Collections
                  </div>
                  <div>
                    Group items into collections to highlight new arrivals,
                    promotions, and featured products.
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </BorderBlock>
      </div>
    </div>
  );
}

function CheckoutManagement() {
  return (
    <div className="container">
      <div>
        <BlockHead
          label="Checkout Experience"
          heading={{
            className: "",
            text: "Seamless checkout experience",
          }}
          subheading={{
            className: "",
            text: "Streamline transactions with fast, user-friendly checkout for enhanced satisfaction.",
          }}
        />
        <BorderBlock backgroundColor={"#fff"}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            <Card
              backgroundColor={
                "radial-gradient(80% 50% at 100% 0%, rgba(39, 180, 135, 0.3) 0%, rgb(248, 249, 250) 100%)"
              }>
              <div className="flex flex-col justify-center p-5 pt-6 lg:p-12 lg:pr-6 pr-6">
                <div className="mr-[-24px] mb-8 md:mb-6 lg:mb-12">
                  <CheckoutExperience />
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none">
                  <path
                    d="M9.31994 13.28H12.4099V20.48C12.4099 21.54 13.7299 22.04 14.4299 21.24L21.9999 12.64C22.6599 11.89 22.1299 10.72 21.1299 10.72H18.0399V3.52003C18.0399 2.46003 16.7199 1.96003 16.0199 2.76003L8.44994 11.36C7.79994 12.11 8.32994 13.28 9.31994 13.28Z"
                    fill="#008060"
                  />
                  <path
                    d="M8.5 4.75H1.5C1.09 4.75 0.75 4.41 0.75 4C0.75 3.59 1.09 3.25 1.5 3.25H8.5C8.91 3.25 9.25 3.59 9.25 4C9.25 4.41 8.91 4.75 8.5 4.75Z"
                    fill="#008060"
                  />
                  <path
                    d="M7.5 20.75H1.5C1.09 20.75 0.75 20.41 0.75 20C0.75 19.59 1.09 19.25 1.5 19.25H7.5C7.91 19.25 8.25 19.59 8.25 20C8.25 20.41 7.91 20.75 7.5 20.75Z"
                    fill="#008060"
                  />
                  <path
                    d="M4.5 12.75H1.5C1.09 12.75 0.75 12.41 0.75 12C0.75 11.59 1.09 11.25 1.5 11.25H4.5C4.91 11.25 5.25 11.59 5.25 12C5.25 12.41 4.91 12.75 4.5 12.75Z"
                    fill="#008060"
                  />
                </svg>
                <div className="mt-3 mb-2 text-lg leading-7 font-semibold text-Neutrals-01 tracking-[-0.1px]">
                  Accelerated Checkout Experience
                </div>
                <div>
                  Deliver a lightning-fast checkout process that enhances
                  customer satisfaction and drives conversions.
                </div>
              </div>
            </Card>
            <Card
              backgroundColor={
                "radial-gradient(80% 50% at 100% 0%, rgba(100, 94, 229, 0.12) 0%, rgb(248, 249, 250) 100%)"
              }>
              <div className="flex flex-col justify-center p-5 lg:p-12 lg:pr-6 pr-6">
                <div className="mr-[-24px] mb-8 md:mb-6 lg:mb-12">
                  <PaymentIntegration />
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M4 3C2.34315 3 1 4.34315 1 6V8H23V6C23 4.34315 21.6569 3 20 3H4ZM23 10H1V18C1 19.6569 2.34315 21 4 21H20C21.6569 21 23 19.6569 23 18V10ZM8 15.5C8 16.3284 7.32843 17 6.5 17C5.67157 17 5 16.3284 5 15.5C5 14.6716 5.67157 14 6.5 14C7.32843 14 8 14.6716 8 15.5ZM11.5 17C12.3284 17 13 16.3284 13 15.5C13 14.6716 12.3284 14 11.5 14C10.6716 14 10 14.6716 10 15.5C10 16.3284 10.6716 17 11.5 17Z"
                    fill="#008060"
                  />
                </svg>
                <div className="mt-3 mb-2 text-lg leading-7 font-semibold text-Neutrals-01">
                  Seamless Payment Integration
                </div>
                <div>
                  Connect with a wide variety of payment providers for a smooth,
                  secure checkout experiencet.
                </div>
              </div>
            </Card>
            <Card
              backgroundColor={
                "radial-gradient(80% 50% at 100% 0%, rgba(39, 180, 135, 0.3) 0%, rgb(248, 249, 250) 100%)"
              }>
              <div className="flex flex-col justify-center p-5 lg:p-12 lg:pr-6 pr-6">
                <div className="mr-[-24px] mb-8 md:mb-6 lg:mb-12">
                  <OrderManagement />
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M5.41832 2.32488C5.71048 2.19898 6.01314 2.42747 6.09093 2.73594C6.41905 4.03699 7.59706 5 9 5H15C16.4029 5 17.5809 4.03699 17.9091 2.73594C17.9869 2.42747 18.2895 2.19898 18.5817 2.32488C20.0042 2.93791 21 4.35266 21 6V19C21 21.2091 19.2091 23 17 23H7C4.79086 23 3 21.2091 3 19V6C3 4.35266 3.99582 2.93791 5.41832 2.32488ZM9 10C9 10.5523 8.55228 11 8 11C7.44772 11 7 10.5523 7 10C7 9.44772 7.44772 9 8 9C8.55228 9 9 9.44772 9 10ZM11 10C11 9.44772 11.4477 9 12 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H12C11.4477 11 11 10.5523 11 10ZM12 13C11.4477 13 11 13.4477 11 14C11 14.5523 11.4477 15 12 15H16C16.5523 15 17 14.5523 17 14C17 13.4477 16.5523 13 16 13H12ZM12 17C11.4477 17 11 17.4477 11 18C11 18.5523 11.4477 19 12 19H14C14.5523 19 15 18.5523 15 18C15 17.4477 14.5523 17 14 17H12ZM9 14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14C7 13.4477 7.44772 13 8 13C8.55228 13 9 13.4477 9 14ZM9 18C9 18.5523 8.55228 19 8 19C7.44772 19 7 18.5523 7 18C7 17.4477 7.44772 17 8 17C8.55228 17 9 17.4477 9 18Z"
                    fill="#008060"
                  />
                  <path
                    d="M9 1H15C15.5523 1 16 1.44772 16 2C16 2.55228 15.5523 3 15 3H9C8.44772 3 8 2.55228 8 2C8 1.44772 8.44772 1 9 1Z"
                    fill="#008060"
                  />
                </svg>
                <div className="mt-3 mb-2 text-lg leading-7 font-semibold text-Neutrals-01">
                  Streamlined Order Management
                </div>
                <div>
                  Efficiently track and manage your orders with real-time
                  updates and seamless fulfillment workflows.
                </div>
              </div>
            </Card>
          </div>
        </BorderBlock>
      </div>
    </div>
  );
}

function Integrations() {
  return (
    <div className="container pt-0 md:pt-5">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-[73px]">
        <BlockHead
          label="Streamline"
          heading={{
            className: "",
            text: "Seamless integrations for every business need",
          }}
          subheading={{
            className: "",
            text: "Connect EverShop with your favorite tools to manage payments, marketing, and more—all from a unified platform. Simplify your workflow and grow your business with ease.",
          }}
          alignment="left"
        />
        <IntegrationLogos />
      </div>
    </div>
  );
}

function ElevateYourStore() {
  return (
    <div className="container">
      <div>
        <BlockHead
          label="Marketplace"
          heading={{
            className: "",
            text: "Elevate your online store",
          }}
          subheading={{
            className: "max-w-[730px]",
            text: "Unlock the potential of your e-commerce business with powerful solutions tailored for seamless growth.",
          }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-9 lg:gap-[68px]">
          <BorderBlock
            backgroundColor={"#fff"}
            bigRadius={false}
            className="marketplace-block h-full grid grid-cols-1">
            <div className="bg-Other-01 rounded-t-xl flex items-center flex-col justify-end pt-5 px-8 h-48 lg:h-80">
              <div className="w-44 mb-2">
                <ThemeExtensionButtons />
              </div>
              <ThemeExtension />
            </div>
            <div className="mt-2 p-4">
              <div className="text-xl font-semibold text-Neutrals-01">
                Expand Your Commerce Capabilities
              </div>
              <div className="mt-3 mb-[15px]">
                Explore a wide range of customizable modules, extensions, and
                themes to enhance customer experience and drive more sales.
              </div>
              <a
                href="/extensions"
                className="text-primary hover:underline flex items-center gap-1 font-semibold">
                <span>Explore the Marketplace</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <path
                    d="M3.33301 10H16.6663M16.6663 10L11.6663 5M16.6663 10L11.6663 15"
                    stroke="#008060"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </a>
            </div>
          </BorderBlock>
          <BorderBlock
            backgroundColor={"#fff"}
            bigRadius={false}
            className="marketplace-block h-full grid grid-cols-1">
            <div className="bg-Other-01 rounded-t-xl flex justify-center flex-col items-center pt-5 px-8 h-48 lg:h-80">
              <img
                src="/img/cloud.webp"
                alt="EverShop cloud"
                width={558}
                height={312}
                className="max-h-full w-auto"
              />
            </div>
            <div className="mt-2 p-4 flex flex-col justify-items-end">
              <div className="text-xl font-semibold text-Neutrals-01">
                Scale with EverShop cloud Solutions
              </div>
              <div className="mt-3 mb-[15px]">
                Coming soon! Discover optimized cloud modules designed to boost
                performance and adapt to your unique needs.
              </div>
              <span className="text-primary flex items-center gap-2 font-semibold">
                Comming Soon
              </span>
            </div>
          </BorderBlock>
        </div>
      </div>
    </div>
  );
}

function Discord() {
  return (
    <div className="discord mt-20">
      <div className="container flex flex-col md:flex-row md:space-y-0 justify-center p-[30px] lg:p-[75px] rounded-lg relative">
        <div className="text-center">
          <img
            src="/img/discord-users.webp"
            width={120}
            height={56}
            alt="EverShop discord channel"
          />
          <h2 className="justify-center text-center text-white pt-4 text-3xl lg:text-[2.5rem]">
            Join the Movement. Create with Us!
          </h2>
          <div className="text-white mb-6 text-base lg:text-xl">
            Be part of a collaborative, creative team on Discord, where every
            idea counts!
          </div>
          <Link
            className="button button--secondary button--large"
            to="https://discord.com/invite/GSzt7dt7RM">
            Start Collaborating
          </Link>
        </div>
      </div>
    </div>
  );
}

function Developer() {
  return (
    <div className="developer overflow-hidden relative container rounded-2xl bg-Other-03 border border-[#0F8769] px-4 md:p-8 lg:px-16 py-4 lg:py-[42px] mt-16">
      <div>
        <h4 className="text-white mb-2 text-lg lg:text-2xl">
          Engineered for developers, designed for efficiency!
        </h4>
        <div className="text-Neutrals-05 max-w-2xl">
          EverShop streamlines the tedious aspects of development, letting you
          focus on building great products with ease.
        </div>
        <div className="flex justify-start gap-4 mt-8">
          <div className="flex justify-items-start">
            <Link
              to="https://discord.com/invite/GSzt7dt7RM"
              className="button--primary button--small text-sm md:text-base shadow-button border-none">
              Join the team
            </Link>
          </div>
          <div className="flex justify-items-start">
            <Link
              to="https://github.com/evershopcommerce/evershop"
              className="button button--small text-sm md:text-base hover:underline bg-Other-03 shadow-button text-white border-none hover:text-white">
              Star us on Github
            </Link>
          </div>
        </div>
      </div>
      <img
        src="/img/logo.svg"
        className="absolute right-0 top-[60%] md:top-[20%] filter grayscale hidden md:block"
        width={230}
        height={230}
        alt="EverShop logo"
      />
    </div>
  );
}

function TechLogo({ src, name }) {
  return (
    <div className="rounded-2xl bg-Other-03 tech-logo flex justify-center items-center p-[1px]">
      <div className="tech-logo-inner p-6 pt-[9px] pb-[13px] flex justify-center items-center w-full h-full flex-col">
        <span className="p-[11px]">
          <img
            src={src}
            alt={name}
            width={60}
            height={60}
            className="h-[60px]"
          />
        </span>
        <div>
          <span className="text-white">{name}</span>
        </div>
      </div>
    </div>
  );
}

function TechStack() {
  return (
    <section className="py-16 md:py-20 bg-[#14181C]">
      <div className="container">
        <BlockHead
          label="Stacks"
          heading={{
            text: "Build faster with the tech you love!",
            className: "text-white",
          }}
          subheading={{
            text: "Supercharge your dev process with your favorite tech!",
            className: "text-white",
          }}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 md:gap-[39px] mb-8 md:mb-[69px]">
          <TechLogo src="/img/react-logo.svg" name="ReactJS" />
          <TechLogo src="/img/graphql-logo.svg" name="GraphQL" />
          <TechLogo src="/img/nodejs-logo.svg" name="NodeJS" />
          <TechLogo src="/img/tailwind-logo.svg" name="TailwindCSS" />
          <TechLogo src="/img/expressjs-logo.svg" name="ExpressJS" />
          <TechLogo src="/img/postgresql-logo.svg" name="PostgreSQL" />
          <TechLogo src="/img/webpack-logo.svg" name="Webpack" />
        </div>
        <CodeShow />
        <ThemeAndExtensionDevelop />
        <Developer />
      </div>
    </section>
  );
}

const DataFetchingDes = () => (
  <>
    <h4 className="text-white mb-1 md:mb-3">
      Data fetching from React component
    </h4>
    <div className="text-white text-lg mb-3 md:mb-10">
      Using Graphql query for loading data and pass to React component as props
      with easy
    </div>
    <a
      href="/docs/development/knowledge-base/data-fetching"
      className=" hover:text-white font-semibold text-primary text-lg">
      Learn more about data fetching ->
    </a>
  </>
);

const Middleware = () => (
  <>
    <h4 className="text-white mb-1 md:mb-3">File based middleware</h4>
    <div className="text-white text-lg mb-3 md:mb-10">
      Using Graphql query for loading data and pass to React component as props
      with easy
    </div>
    <a
      href="/docs/development/knowledge-base/middleware-system"
      className=" hover:text-white font-semibold text-primary text-lg">
      Learn more about middleware ->
    </a>
  </>
);

const DynamicLayout = () => (
  <>
    <h4 className="text-white mb-1 md:mb-3">Dynamic layout</h4>
    <div className="text-white text-lg mb-3 md:mb-10">
      Using Graphql query for loading data and pass to React component as props
      with easy
    </div>
    <a
      href="/docs/development/theme/templating"
      className=" hover:text-white font-semibold text-primary text-lg">
      Learn more about layout system ->
    </a>
  </>
);
function CodeShow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-Other-03 rounded-xl mb-8">
      <div className="col-span-1 p-6 md:p-8 lg:p-16">
        <FadeInOutSlides
          slides={[
            { content: DataFetchingDes },
            { content: Middleware },
            { content: DynamicLayout },
          ]}
          loop={true}
          full={false}
          interval={5000}
        />
      </div>
      <div className="col-span-1 pb-2 md:pb-6">
        <DataFetching />
      </div>
    </div>
  );
}

function ThemeAndExtensionDevelop() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-1">
      <div className="bg-Other-03 px-6 py-6 md:px-8 lg:px-16 lg:py-[60px] rounded-xl grid grid-cols-1">
        <h4 className="text-white">
          Master the art of theme customization for your online store
        </h4>
        <p className="text-white text-lg mb-6">
          Effortlessly create a unique look for your store with EverShop’s theme
          customization tools. From minimal to feature-rich designs, you’ll have
          full control over your store’s appearance.
        </p>
        <a
          href="/docs/development/theme"
          className="text-primary font-semibold hover:text-white text-lg">
          Explore theme customization ->
        </a>
      </div>
      <div className="bg-Other-03 px-6 py-6 md:px-8 lg:px-16 lg:py-[60px] rounded-xl  grid grid-cols-1">
        <h4 className="text-white">
          Build extensions to enhance and integrate your store
        </h4>
        <p className="text-white text-lg mb-6">
          Develop custom extensions to meet your business needs. Seamlessly
          integrate EverShop with existing systems or add functionality to
          enhance the platform and align with your goals.
        </p>
        <a
          href="/docs/development/module/module-overview"
          className="text-primary font-semibold hover:text-white text-lg">
          Learn about extension development ->
        </a>
      </div>
    </div>
  );
}

function TestimonialCard({ name, jobTitle, content }) {
  return name ? (
    <div className="bg-Other-01 p-5 lg:p-8 rounded-xl col-span-1">
      <div className="text-Neutrals-04 mb-5">&quot;{content}&quot;</div>
      <div className="flex justify-start items-center">
        <div>
          <div className="text-Neutrals-01 mb-1 font-semibold">{name}</div>
          <div className="text-Neutrals-04">{jobTitle}</div>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-Other-01 p-4 rounded-xl rounded-t-none col-span-1"></div>
  );
}

function TestimonialColumn({ testimonials }) {
  return (
    <div className="grid gap-6">
      {testimonials.map((testimonial, i) => (
        <TestimonialCard {...testimonial} key={i} />
      ))}
    </div>
  );
}

function Testimonials() {
  const columnOne = [
    {
      name: "João Doria Neto",
      jobTitle: "Solution architect",
      content:
        "Seamless integration with our existing systems and fantastic support from the EverShop team! Their open-source solution was exactly what we needed to expand our store’s capabilities.",
    },
    {
      name: "Dawn Tepper",
      jobTitle: "Developer",
      content:
        "Building custom widgets with EverShop has allowed us to stay ahead of competitors. The platform is incredibly developer-friendly, and we love the flexibility it offers for customizing our store.",
    },
  ];

  const columnTwo = [
    {
      name: "Cliff Franco",
      jobTitle: "Tech lead",
      content:
        "EverShop’s performance features have really transformed how we manage high-traffic periods. The scalability is impressive, and real-time data updates made our operations much smoother.",
    },
    {
      name: "Xiang Chao",
      jobTitle: "Product owner",
      content:
        "Thanks to EverShop, our system performance has improved significantly. After their updates, we’ve experienced a 25% boost in speed and reliability, even during peak traffic. They delivered exactly what we needed, on time and with precision.",
    },
  ];

  const columnThree = [
    {
      name: "Francesco Cortese",
      jobTitle: "Sale manager",
      content:
        "EverShop has been a game-changer for our business. It’s incredibly easy to use and has helped us streamline our operations and improve customer satisfaction.",
    },
    {
      name: "Irena Phaedra",
      jobTitle: "Shop owner",
      content:
        "EverShop transformed our promotional campaigns with their dynamic discount features, leading to a 15% increase in sales during our latest campaign. The backend tools made setting up promotions quick and hassle-free.",
    },
  ];

  return (
    <div className="container pt-20 relative">
      <BlockHead
        label="Testimonials"
        heading={{
          className: "",
          text: "Real results, real impact: testimonials from our clients",
        }}
        subheading={{
          className: "max-w-[760px]",
          text: "See how businesses have used our solution to streamline operations and improve customer satisfaction.",
        }}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TestimonialColumn testimonials={columnOne} />
        <TestimonialColumn testimonials={columnTwo} />
        <TestimonialColumn testimonials={columnThree} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-br from-yellow-500 via-orange-600 to-red-700 w-full min-h-48"></div>
    </div>
  );
}

export default function Home() {
  return (
    <Layout
      title="Open source TypeScript ecommerce platform"
      description="EverShop ecommerce platform provides the best developer experience and rich ecommerce features that help build online stores and start selling online.">
      <HomepageHeader />
      <main>
        <Logos />
        <Separator isFirst={true} />
        <DynamicWidgets />
        <Separator />
        <CatalogManagement />
        <Separator />
        <CheckoutManagement />
        <Separator />
        <Integrations />
        <Separator />
        <ElevateYourStore />
        <HomepageWebDevFeatures />
        <TechStack />
        <Testimonials />
        <Discord />
      </main>
    </Layout>
  );
}

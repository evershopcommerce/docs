import React from "react";
import SlidingImage from "./SlidingImage";

const Category = ({ children }) => {
  return (
    <div className="w-full h-64 pl-5 pt-5 md:pl-6 md:pt-6 pb-4 bg-white rounded-tl-2xl rounded-bl-2xl justify-start items-center inline-flex">
      <div className="self-stretch flex-col justify-start items-start gap-6 inline-flex w-full">
        <div className="self-stretch justify-between items-center inline-flex w-full pr-1 md:pr-6">
          <div className="grow shrink basis-0 flex-col justify-start items-start gap-1 inline-flex">
            <div className="self-stretch justify-start items-center gap-3 inline-flex">
              <div className="w-2.5 h-2.5 bg-Success-01 rounded-full" />
              <div className="text-[#686f82] text-sm font-medium leading-none">
                Category Name
              </div>
            </div>
            <div className="self-stretch px-6 justify-start items-center gap-2.5 inline-flex">
              <div className="grow shrink basis-0 text-Neutrals-01 text-base font-semibold leading-normal">
                Man
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center p-1 bg-[#F4F5F6] rounded-[16px] border border-gray-200 shadow-sm font-medium">
            <button className="ml-auto flex items-center px-3 py-2 bg-white rounded-[12px] border border-gray-200 shadow-sm font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M14.3963 2.12867C14.6934 2.34607 14.7581 2.7632 14.5407 3.06035L6.73675 13.727C6.62964 13.8734 6.4675 13.9699 6.28773 13.9941C6.10795 14.0183 5.92607 13.9682 5.78403 13.8554L1.58795 10.522C1.29966 10.293 1.25161 9.87366 1.48063 9.58537C1.70965 9.29707 2.12901 9.24902 2.41731 9.47804L6.07025 12.3799L13.4646 2.27307C13.682 1.97592 14.0991 1.91127 14.3963 2.12867Z"
                  fill="#00764A"
                />
              </svg>
              <span className="pl-1 text-xs md:text-sm font-medium">
                Add product
              </span>
            </button>
          </div>
        </div>
        <div className="self-stretch h-36 flex-col justify-start items-start gap-5 flex">
          <div className="self-stretch gap-3 grid grid-cols-3 md:grid-cols-4">
            <div className="flex-col justify-center items-start gap-4 inline-flex">
              <SlidingImage
                src="/img/category-one.webp"
                alt="Category One"
                width="112"
                height="112"
                delay={500}
              />
              <div className="flex-col justify-start items-start gap-2 flex w-full">
                <div className="w-3/4 h-1.5 opacity-10 bg-[#686f82] rounded-sm" />
                <div className="w-1/2 h-1.5 opacity-10 bg-[#686f82] rounded-sm" />
              </div>
            </div>
            <div className="flex-col justify-center items-start gap-4 inline-flex">
              <SlidingImage
                src="/img/category-two.webp"
                alt="Category Two"
                width="112"
                height="112"
                delay={800}
              />
              <div className="flex-col justify-start items-start gap-2 flex w-full">
                <div className="w-3/4 h-1.5 opacity-10 bg-[#686f82] rounded-sm" />
                <div className="w-1/2 h-1.5 opacity-10 bg-[#686f82] rounded-sm" />
              </div>
            </div>
            <div className="flex-col justify-center items-start gap-4 inline-flex">
              <SlidingImage
                src="/img/category-three.webp"
                alt="Category Three"
                width="112"
                height="112"
                delay={1200}
              />
              <div className="flex-col justify-start items-start gap-2 flex w-full">
                <div className="w-3/4 h-1.5 opacity-10 bg-[#686f82] rounded-sm" />
                <div className="w-1/2 h-1.5 opacity-10 bg-[#686f82] rounded-sm" />
              </div>
            </div>
            <div className="flex-col justify-center items-start gap-4 hidden md:inline-flex">
              <SlidingImage
                src="/img/category-four.webp"
                alt="Category Four"
                width="112"
                height="112"
                delay={1500}
              />
              <div className="flex-col justify-start items-start gap-2 flex w-full">
                <div className="w-3/4 h-1.5 opacity-10 bg-[#686f82] rounded-sm" />
                <div className="w-1/2 h-1.5 opacity-10 bg-[#686f82] rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;

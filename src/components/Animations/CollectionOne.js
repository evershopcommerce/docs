import * as React from "react";
import SlidingImage from "./SlidingImage";
const CollectionOne = (props) => (
  <div className="w-full h-64 pb-4 justify-start items-center inline-flex">
    <div className="self-stretch flex-col justify-start items-start gap-6 inline-flex w-full">
      <div className="self-stretch justify-between items-center inline-flex">
        <div className="grow shrink basis-0 flex-col justify-start items-start gap-1 inline-flex">
          <div className="self-stretch justify-center items-center gap-3 inline-flex">
            <div className="text-Neutrals-01 text-base font-semibold font-['Inter'] leading-none">
              ⚡ Today’s Hot Picks ⚡️
            </div>
          </div>
          <div className="self-stretch px-[22px] justify-center items-center gap-2.5 inline-flex">
            <div className="grow shrink basis-0 text-center text-Neutrals-01 text-sm font-normal font-['Inter'] leading-normal">
              Discover our hot deals
            </div>
          </div>
        </div>
      </div>
      <div className="self-stretch h-36 flex-col justify-start items-start gap-5 flex">
        <div className="self-stretch gap-3 grid grid-cols-3 md:grid-cols-4">
          <div className="flex-col justify-center items-start gap-4 inline-flex">
            <SlidingImage
              src="/img/category-one.webp"
              alt="Category One"
              width="112px"
              height="112px"
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
              width="112px"
              height="112px"
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
              width="112px"
              height="112px"
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
              width="112px"
              height="112px"
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
export default CollectionOne;

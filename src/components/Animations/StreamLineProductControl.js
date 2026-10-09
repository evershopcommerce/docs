import React, { useEffect, useState } from "react";
import { useSpring, animated, useSprings } from "@react-spring/web";
import MovingBorder from "./MovingBorder";
import FadeInOutSlides from "./FadeInOutSlides";

function SlidingImage({
  src,
  alt,
  width,
  height,
  startSlide,
  delay = 0,
  isLast = false,
}) {
  // Define the animation for "back in left" effect
  const [imageAnimation, api] = useSpring(() => ({
    from: { transform: "translateX(-100%)", opacity: 0 },
    to: {
      transform: "translateX(0%)",
      opacity: 1,
    },
    config: { tension: 300, friction: 20 }, // Customize for a "back in" feel
    delay: delay,
    onRest: () => {
      if (isLast) {
        // Wait for 1200ms before triggering the next slide
        setTimeout(() => {
          startSlide();
        }, 2000);
      }
    },
  }));

  return (
    <animated.img
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{
        ...imageAnimation,
      }}
    />
  );
}

const colors = ["#a9a07c", "#a4cfc1", "#CD519F"];
const Before = ({ startSlide }) => {
  return (
    <div className="">
      <div className="flex gap-5 items-start">
        <div className="w-16 md:w-24">
          <SlidingImage
            src="/img/shoe-one.webp"
            alt="Air Force 1 Low EWP"
            width={100}
            height={100}
            startSlide={startSlide}
            delay={0}
          />
        </div>
        <div className="text-xs md:text-base">
          <div className="text-[13px] leading-[18px] text-Neutrals-04">Men</div>
          <div className="font-medium">Air Force 1 Low EWP</div>
          <div className="text-sm text-Neutrals-04">3 colours</div>
          <div className="text-xs md:text-[15px] leading-[24px] font-semibold mt-1">
            $280.00 - $399.00
          </div>
        </div>
        <div className="ml-auto flex items-center p-1 bg-[#F4F5F6] rounded-[16px] border border-gray-200 shadow-sm font-medium">
          <button className="ml-auto flex items-center px-2 mdpx-3 py-1 md:py-2 bg-white rounded-[12px] border border-gray-200 shadow-sm font-medium">
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
            <span className="pl-1 text-xs md:text-sm font-medium">Push</span>
          </button>
        </div>
      </div>

      <div className="mt-4 border-b border-gray-200">
        <div className="grid grid-cols-4 lg:grid-cols-6 text-[11px] font-medium text-Neutrals-04 py-2">
          <div>VARIANT</div>
          <div>SIZE</div>
          <div>COLOR</div>
          <div className="text-left">PRICE</div>
          <div className="text-left hidden lg:block">STOCK</div>
          <div className="text-right hidden lg:block">ACTION</div>
        </div>
      </div>
      <div className="text-Neutrals-01 font-medium">
        <div className="grid grid-cols-4 lg:grid-cols-6 items-center py-2">
          <div>
            <MovingBorder>
              <SlidingImage
                src="/img/shoe-two.webp"
                alt="Variant Red"
                width={48}
                height={48}
                startSlide={startSlide}
                delay={1000}
              />
            </MovingBorder>
          </div>
          <div className="text-[13px]">X</div>
          <div className="text-[13px]">Red</div>
          <div className="text-left text-[13px] font-semibold">$280.00</div>
          <div className="text-left text-[13px] font-semibold hidden lg:block">
            130
          </div>
          <div className="text-right text-[13px] font-semibold hidden lg:block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none">
              <g clipPath="url(#clip0_178_961)">
                <path
                  d="M7.33301 2.66666H4.53301C3.4129 2.66666 2.85285 2.66666 2.42503 2.88464C2.0487 3.07639 1.74274 3.38235 1.55099 3.75867C1.33301 4.1865 1.33301 4.74655 1.33301 5.86666V11.4667C1.33301 12.5868 1.33301 13.1468 1.55099 13.5746C1.74274 13.951 2.0487 14.2569 2.42503 14.4487C2.85285 14.6667 3.4129 14.6667 4.53301 14.6667H10.133C11.2531 14.6667 11.8132 14.6667 12.241 14.4487C12.6173 14.2569 12.9233 13.951 13.115 13.5746C13.333 13.1468 13.333 12.5868 13.333 11.4667V8.66666M5.33299 10.6667H6.44935C6.77547 10.6667 6.93853 10.6667 7.09198 10.6298C7.22803 10.5972 7.35809 10.5433 7.47739 10.4702C7.61194 10.3877 7.72724 10.2724 7.95785 10.0418L14.333 3.66666C14.8853 3.11437 14.8853 2.21894 14.333 1.66666C13.7807 1.11437 12.8853 1.11437 12.333 1.66665L5.95783 8.04182C5.72723 8.27242 5.61193 8.38772 5.52947 8.52228C5.45637 8.64157 5.40249 8.77163 5.36983 8.90768C5.33299 9.06113 5.33299 9.22419 5.33299 9.55031V10.6667Z"
                  stroke="#687082"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_178_961">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
        <div className="grid grid-cols-4 lg:grid-cols-6 items-center py-2">
          <div>
            <MovingBorder>
              <SlidingImage
                src="/img/shoe-three.webp"
                alt="Variant Green"
                width={48}
                height={48}
                startSlide={startSlide}
                delay={1700}
                isLast={true}
              />
            </MovingBorder>
          </div>
          <div className="text-[13px]">M</div>
          <div className="text-[13px]">Green</div>
          <div className="text-left text-[13px] font-semibold">$300.00</div>
          <div className="text-left text-[13px] font-semibold hidden lg:block">
            160
          </div>
          <div className="text-right text-[13px] font-semibold hidden lg:block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none">
              <g clipPath="url(#clip0_178_961)">
                <path
                  d="M7.33301 2.66666H4.53301C3.4129 2.66666 2.85285 2.66666 2.42503 2.88464C2.0487 3.07639 1.74274 3.38235 1.55099 3.75867C1.33301 4.1865 1.33301 4.74655 1.33301 5.86666V11.4667C1.33301 12.5868 1.33301 13.1468 1.55099 13.5746C1.74274 13.951 2.0487 14.2569 2.42503 14.4487C2.85285 14.6667 3.4129 14.6667 4.53301 14.6667H10.133C11.2531 14.6667 11.8132 14.6667 12.241 14.4487C12.6173 14.2569 12.9233 13.951 13.115 13.5746C13.333 13.1468 13.333 12.5868 13.333 11.4667V8.66666M5.33299 10.6667H6.44935C6.77547 10.6667 6.93853 10.6667 7.09198 10.6298C7.22803 10.5972 7.35809 10.5433 7.47739 10.4702C7.61194 10.3877 7.72724 10.2724 7.95785 10.0418L14.333 3.66666C14.8853 3.11437 14.8853 2.21894 14.333 1.66666C13.7807 1.11437 12.8853 1.11437 12.333 1.66665L5.95783 8.04182C5.72723 8.27242 5.61193 8.38772 5.52947 8.52228C5.45637 8.64157 5.40249 8.77163 5.36983 8.90768C5.33299 9.06113 5.33299 9.22419 5.33299 9.55031V10.6667Z"
                  stroke="#687082"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_178_961">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const After = ({ startSlide }) => {
  const [index, setIndex] = useState(0);

  // Using useSprings to animate each dot with staggered timing
  const colorSprings = useSprings(
    colors.length,
    colors.map((_, i) => ({
      borderColor: i === index ? "#008060" : "transparent", // Change color based on index
      config: { duration: 300 }, // Stagger the timing
    }))
  );

  const imageSprings = useSprings(
    colors.length,
    colors.map((_, i) => ({
      // Fade in effect
      opacity: i === index ? 1 : 0,
      config: { duration: 300 },
    }))
  );

  // Start the animation when the element becomes visible
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => {
        // Start from the beginning if reached the end
        if (prevIndex === colors.length - 1) {
          return colors.length - 1;
        }
        return prevIndex + 1;
      });
    }, 1500); // Adjust time to control speed

    return () => clearInterval(interval); // Clean up on component unmount
  });

  // If reached the end, wait for 1500ms and trigger the next slide
  useEffect(() => {
    if (index === colors.length - 1) {
      const timeout = setTimeout(() => {
        startSlide();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [index]);

  return (
    <div className="">
      <div className="grid grid-cols-[40%_60%] md:grid-cols-2 grid-row gap-3 md:gap-6">
        <div className="pl-2 bg-[#f4f5f6] rounded-lg flex-col justify-center items-center inline-flex w-full">
          <div className="grid grid-cols-1 grid-rows-1">
            {imageSprings.map((styles, i) => (
              <animated.img
                key={i}
                src={`/img/shoe-${colors[i].replace("#", "")}.webp`}
                alt={`Variant ${colors[i]}`}
                className="rounded-lg col-span-1 row-span-1 col-start-1 row-start-1"
                style={{
                  ...styles,
                }}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-[11px] divide-Neutrals-06 divide-y">
          <div className="flex-col justify-start items-start gap-1 flex">
            <div className="flex-col justify-start items-start flex">
              <div className="flex-col justify-start items-start gap-0.5 flex">
                <div className="justify-between items-center inline-flex">
                  <div className="text-Neutrals-01 text-sm md:text-lg font-semibold leading-normal">
                    Air Force 1 Low EWP
                  </div>
                </div>
                <div className="justify-start items-start gap-0.5 inline-flex">
                  <div className="text-[#686f82] text-xs md:text-[13px] font-normal leading-[18px]">
                    Men
                  </div>
                </div>
                <div className="text-Neutrals-01 text-xs md:text-[15px] font-medium leading-normal">
                  $280.00 - $399.00
                </div>
              </div>
            </div>
          </div>
          <div className="flex-col justify-start items-start gap-2 flex pt-[11px]">
            <div className="self-stretch text-Neutrals-01 text-[13px] font-medium font-['Inter'] leading-tight">
              Choose a Color
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {" "}
              {/* Adjust margin for demo */}
              {colorSprings.map((styles, i) => (
                <animated.div
                  key={i}
                  className="p-[3px] rounded-[100px] border border-transparent justify-start items-center gap-2.5 flex"
                  style={{
                    ...styles,
                  }}>
                  <div
                    className="w-5 h-5 md:w-7 md:h-7 rounded-full"
                    style={{
                      backgroundColor: colors[i],
                    }}></div>
                </animated.div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3  pt-[11px]">
            <div className="flex gap-3 items-center">
              <div className="w-[100px] h-7 px-1 md:w-[117px] md:h-9 rounded-xl border border-Neutrals-06 flex justify-center items-center gap-6">
                <div className="text-2xl">-</div>
                <div className="text-Neutrals-01 text-sm font-medium leading-tight">
                  3
                </div>
                <div className="text-2xl">+</div>
              </div>
              <div className="hidden lg:block text-right text-[#dd0003] text-[11px] font-medium leading-[18px]">
                Only 10 items Left
              </div>
            </div>
            <div className="px-6 py-[13px] bg-[#008060] rounded-xl justify-center items-center gap-2.5 inline-flex">
              <div className="text-white text-sm font-semibold leading-none">
                Buy Now
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const items = [
  { id: 1, content: ({ startSlide }) => <Before startSlide={startSlide} /> },
  { id: 2, content: ({ startSlide }) => <After startSlide={startSlide} /> },
];

export default function StreamLineProductControl() {
  return (
    <div className="StreamLineProductControl">
      <div className="absolute top-[-40px] left-6 bottom-0 right-0 flex justify-end">
        <div
          style={{
            width: "548px",
            height: "100%",
          }}
          className="ml-auto rounded-l-2xl md:rounded-b-none md:rounded-t-2xl md:shadow-lg p-3 pl-4 lg:pl-6 pt-4 md:pt-6 lg:p-6 bg-white">
          <FadeInOutSlides slides={items} />
        </div>
      </div>
    </div>
  );
}

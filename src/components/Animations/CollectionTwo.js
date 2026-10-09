import * as React from "react";
import { useTrail, animated } from "@react-spring/web";
const One = () => (
  <>
    <div className="w-4 h-4 left-0 top-0 absolute border border-Neutrals-04 rounded-sm"></div>
    <div className="left-[65px] top-0 absolute text-Neutrals-01 text-[13px] font-medium font-['Inter'] leading-none">
      1
    </div>
    <div className="left-[151px] top-0 absolute text-Neutrals-01 text-[13px] font-medium font-['Inter'] leading-none">
      Hot Deals
    </div>
    <div className="left-[363px] top-0 absolute text-Neutrals-01 text-[13px] font-medium font-['Inter'] leading-none">
      hot__deals
    </div>
  </>
);

const Two = () => (
  <>
    <div className="w-4 h-4 left-0 top-0 absolute border border-Neutrals-04 rounded-sm"></div>
    <div className="left-[65px] top-0 absolute text-Neutrals-01 text-[13px] font-medium font-['Inter'] leading-none">
      2
    </div>
    <div className="left-[151px] top-0 absolute text-Neutrals-01 text-[13px] font-medium font-['Inter'] leading-none">
      New Arrivals
    </div>
    <div className="left-[363px] top-0 absolute text-Neutrals-01 text-[13px] font-medium font-['Inter'] leading-none">
      new__arrivals
    </div>
  </>
);
const Three = () => (
  <>
    <div className="w-4 h-4 left-0 top-0 absolute border border-Neutrals-04 rounded-sm"></div>
    <div className="left-[65px] top-0 absolute text-Neutrals-01 text-[13px] font-medium font-['Inter'] leading-none">
      3
    </div>
    <div className="left-[151px] top-0 absolute text-Neutrals-01 text-[13px] font-medium font-['Inter'] leading-none">
      Featured Products
    </div>
    <div className="left-[363px] top-0 absolute text-Neutrals-01 text-[13px] font-medium font-['Inter'] leading-none">
      featured__products
    </div>
  </>
);

const CollectionTwo = (props) => {
  const svgRef = React.useRef();
  const [inView, setInView] = React.useState(false);
  // Set up Intersection Observer
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        } else {
          setInView(false);
        }
      },
      { threshold: 0.5 } // Trigger when at least half the SVG is visible
    );
    if (svgRef.current) observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, []);

  const components = [<One />, <Two />, <Three />];
  // Set up the staggered animation using useTrail
  const trail = useTrail(components.length, {
    from: { opacity: 0, transform: "translateY(100px)" },
    to: {
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0px)" : "translateY(100px)",
    },
    config: { tension: 200, friction: 20 },
    delay: 200, // Delay to add time before the next animation starts
  });
  return (
    <div
      ref={svgRef}
      className="w-[492px] h-[220px] flex-col justify-start items-start gap-8 inline-flex overflow-hidden">
      <div className="self-stretch justify-between items-center inline-flex">
        <div className="grow shrink basis-0 flex-col justify-start items-start gap-1 inline-flex">
          <div className="self-stretch justify-start items-center gap-3 inline-flex">
            <div className="text-Neutrals-01 text-base font-semibold font-['Inter'] leading-none">
              Collection
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
                fill="#00764A"></path>
            </svg>
            <span className="pl-1 text-sm font-medium">Add collection</span>
          </button>
        </div>
      </div>
      <div className="self-stretch h-[137px] flex-col justify-start items-start gap-4 flex">
        <div className="self-stretch h-[25px] flex-col justify-start items-start gap-2 flex">
          <div className="w-[394px] h-4 relative">
            <div className="left-[65px] top-0 absolute text-[#343845] text-[11px] font-normal font-['Inter'] leading-none">
              ID
            </div>
            <div className="left-[151px] top-0 absolute text-[#343845] text-[11px] font-normal font-['Inter'] leading-none">
              COLLECTION NAME
            </div>
            <div className="left-[363px] top-0 absolute text-[#343845] text-[11px] font-normal font-['Inter'] leading-none">
              CODE
            </div>
            <div className="w-4 h-4 left-0 top-0 absolute"></div>
          </div>
          <div className="self-stretch h-px bg-[#f4f5f6]"></div>
        </div>
        <div className="flex-col justify-start items-start gap-6 flex">
          {trail.map((props, index) => (
            <animated.div
              className="w-[449px] h-4 relative"
              key={index}
              style={props}
              transform={`translate(0, ${index * 60})`}>
              {components[index]}
            </animated.div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default CollectionTwo;

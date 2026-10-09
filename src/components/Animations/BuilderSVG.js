import React, { useEffect } from "react";
import { useSpring, animated, useSpringRef, useChain } from "@react-spring/web";

const Header = (props) => (
  <svg
    viewBox="0 0 1440 81"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <g filter="url(#filter0_d_4867_2969)">
      <g clipPath="url(#clip0_4867_2969)">
        <path
          d="M46.9046 21.1922C48.8209 20.0858 51.1819 20.0858 53.0982 21.1922L63.0085 26.914C64.9248 28.0203 66.1053 30.065 66.1053 32.2777V43.7212C66.1053 45.9339 64.9248 47.9786 63.0085 49.085L53.0982 54.8067C51.1819 55.9131 48.8209 55.9131 46.9046 54.8067L36.9943 49.085C35.078 47.9786 33.8975 45.9339 33.8975 43.7212V32.2777C33.8975 30.065 35.078 28.0203 36.9943 26.914L46.9046 21.1922Z"
          fill="url(#paint0_linear_4867_2969)"
        />
        <path
          d="M50.0813 27V27C50.0813 27.1029 50.0813 27.2057 50.0813 27.3086C50.0813 31.1148 50.0813 34.9724 50.0813 38.7786C50.0813 38.8301 50.0813 38.9329 50.0813 38.9844C50.0813 39.0358 50.0298 39.0872 49.9784 39.0872C49.6184 39.2416 49.3098 39.3959 48.9497 39.5502C48.4868 39.7559 47.9724 39.9616 47.5095 40.2188C46.9437 40.476 46.378 40.7332 45.8122 40.9903C45.3492 41.1961 44.8863 41.4018 44.4234 41.6076C43.8576 41.8647 43.2918 42.1219 42.7261 42.3791C42.2631 42.5848 41.8002 42.7906 41.2859 43.0478C40.9258 43.2021 40.5144 43.4078 40.1543 43.5621C40.1029 43.5621 40.1029 43.6135 40.0514 43.5621C40.0514 43.5621 40.0514 43.5621 40 43.5621C40.1543 43.3049 40.3086 43.0992 40.4629 42.842C41.2859 41.4533 42.1603 40.0645 42.9832 38.6758C43.8576 37.1841 44.7835 35.6925 45.6579 34.2009C46.4808 32.8122 47.3038 31.4234 48.1267 30.0861C48.744 29.0574 49.3612 28.0801 49.927 27.0514C50.0298 27.0514 50.0298 27 50.0813 27C50.0298 27 50.0813 27 50.0813 27V27Z"
          fill="white"
        />
        <path
          d="M40.0508 43.5625C40.0508 43.5625 40.1022 43.5625 40.0508 43.5625C40.1022 43.5625 40.1022 43.5625 40.0508 43.5625C40.0508 43.6139 40.0508 43.6139 40.0508 43.5625V43.5625V43.5625Z"
          fill="#808080"
        />
        <path
          d="M40.1016 43.6135C40.1016 43.5621 40.1016 43.5621 40.1016 43.6135C40.6159 43.3564 41.1303 43.1506 41.6446 42.8934C42.3133 42.5848 42.9819 42.2762 43.6506 41.9676C44.1649 41.7104 44.6793 41.5047 45.1936 41.2475C45.9137 40.8875 46.6853 40.5789 47.4053 40.2188C47.9197 40.0131 48.434 39.7559 48.9484 39.5502C49.3084 39.3959 49.6685 39.2416 50.0285 39.0358C50.08 39.0358 50.08 38.9844 50.1314 38.9844C50.1314 38.9844 50.1314 38.9844 50.1314 39.0358C50.1314 39.0872 50.1314 39.0872 50.1314 39.1387C50.1314 42.5334 50.1314 45.9281 50.1314 49.3228C50.1314 49.3743 50.1314 49.4257 50.1314 49.4771C50.08 49.5286 50.08 49.4771 50.0285 49.4771C49.8742 49.3743 49.7199 49.3228 49.6171 49.22C46.4795 47.3683 43.342 45.5166 40.2044 43.665C40.153 43.6135 40.1016 43.6135 40.1016 43.6135Z"
          fill="#D7D7D7"
        />
        <path
          d="M50.082 39.0352V39.0352C50.082 38.9837 50.082 38.9323 50.082 38.9323C50.082 35.0232 50.082 31.0627 50.082 27.1537C50.082 27.1022 50.082 27.0508 50.082 27.0508C53.3739 32.5029 56.6657 37.955 59.9576 43.4071C60.009 43.4586 60.0604 43.51 60.0604 43.5614C59.8547 43.4586 59.649 43.3557 59.3918 43.2528C59.1346 43.15 58.8774 42.9957 58.6203 42.8928C58.466 42.8414 58.3116 42.7385 58.1059 42.6871C57.8487 42.5842 57.5401 42.4299 57.2829 42.327C57.1286 42.2756 56.9743 42.1727 56.82 42.1213C56.46 41.967 56.0999 41.8127 55.7399 41.6584C55.5342 41.5555 55.3798 41.504 55.1741 41.4012C54.9169 41.2983 54.6598 41.144 54.4026 41.0411C54.2483 40.9897 54.094 40.8868 53.9397 40.8354C53.5796 40.6811 53.2196 40.5268 52.8595 40.3725C52.6538 40.2696 52.4995 40.2182 52.2937 40.1153C52.0366 40.0124 51.7794 39.8581 51.5222 39.7553C51.3679 39.6524 51.1622 39.6009 51.0079 39.4981C50.6993 39.3438 50.3906 39.1895 50.082 39.0352V39.0352Z"
          fill="url(#paint1_linear_4867_2969)"
        />
      </g>
      <text
        fill="#1A1D1F"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={16}
        letterSpacing="0.01em">
        <tspan x={120.476} y={44.064}>
          {"New & Featured"}
        </tspan>
      </text>
      <text
        fill="#1A1D1F"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={16}
        letterSpacing="0.01em">
        <tspan x={277.192} y={44.064}>
          {"Men"}
        </tspan>
      </text>
      <text
        fill="#1A1D1F"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={16}
        letterSpacing="0.01em">
        <tspan x={346.024} y={44.064}>
          {"Women"}
        </tspan>
      </text>
      <text
        fill="#1A1D1F"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={16}
        letterSpacing="0.01em">
        <tspan x={439.315} y={44.064}>
          {"Kids"}
        </tspan>
      </text>
      <text
        fill="#1A1D1F"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={16}
        letterSpacing="0.01em">
        <tspan x={509.153} y={44.064}>
          {"Accessories"}
        </tspan>
      </text>
      <g clipPath="url(#clip1_4867_2969)">
        <path
          d="M1300.03 42.617L1304.32 46.899L1302.9 48.314L1298.62 44.031C1297.03 45.3082 1295.05 46.0029 1293 46C1288.04 46 1284 41.968 1284 37C1284 32.032 1288.04 28 1293 28C1297.97 28 1302 32.032 1302 37C1302.01 39.042 1301.31 41.0237 1300.03 42.617ZM1298.03 41.875C1299.3 40.5699 1300.01 38.8204 1300 37C1300 33.132 1296.87 30 1293 30C1289.14 30 1286 33.132 1286 37C1286 40.867 1289.14 44 1293 44C1294.82 44.0029 1296.57 43.2941 1297.88 42.025L1298.03 41.875V41.875Z"
          fill="#1A1D1F"
        />
      </g>
      <g clipPath="url(#clip2_4867_2969)">
        <path
          d="M1336.5 28H1347.5C1347.66 28 1347.81 28.0361 1347.95 28.1056C1348.09 28.175 1348.21 28.2758 1348.3 28.4L1351 32V47C1351 47.2652 1350.9 47.5196 1350.71 47.7071C1350.52 47.8946 1350.27 48 1350 48H1334C1333.74 48 1333.48 47.8946 1333.3 47.7071C1333.11 47.5196 1333 47.2652 1333 47V32L1335.7 28.4C1335.8 28.2758 1335.92 28.175 1336.06 28.1056C1336.2 28.0361 1336.35 28 1336.5 28ZM1349 34H1335V46H1349V34ZM1348.5 32L1347 30H1337L1335.5 32H1348.5ZM1339 36V38C1339 38.7956 1339.32 39.5587 1339.88 40.1213C1340.45 40.6839 1341.21 41 1342 41C1342.8 41 1343.56 40.6839 1344.13 40.1213C1344.69 39.5587 1345 38.7956 1345 38V36H1347V38C1347 39.3261 1346.48 40.5979 1345.54 41.5355C1344.6 42.4732 1343.33 43 1342 43C1340.68 43 1339.41 42.4732 1338.47 41.5355C1337.53 40.5979 1337 39.3261 1337 38V36H1339Z"
          fill="#1A1D1F"
        />
      </g>
      <rect
        x={1344.2}
        y={19.2}
        width={20.6}
        height={20.6}
        rx={10.3}
        fill="#FF6A55"
        stroke="white"
        strokeWidth={1.6}
      />
      <text
        fill="white"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={12}
        letterSpacing="0.01em">
        <tspan x={1351.17} y={33.548}>
          {"3"}
        </tspan>
      </text>
      <g clipPath="url(#clip3_4867_2969)">
        <path
          d="M1398 48H1396V46C1396 45.2044 1395.69 44.4413 1395.13 43.8787C1394.56 43.3161 1393.8 43 1393 43H1387C1386.21 43 1385.45 43.3161 1384.88 43.8787C1384.32 44.4413 1384 45.2044 1384 46V48H1382V46C1382 44.6739 1382.53 43.4021 1383.47 42.4645C1384.41 41.5268 1385.68 41 1387 41H1393C1394.33 41 1395.6 41.5268 1396.54 42.4645C1397.48 43.4021 1398 44.6739 1398 46V48ZM1390 39C1389.22 39 1388.44 38.8448 1387.71 38.5433C1386.98 38.2417 1386.32 37.7998 1385.76 37.2426C1385.2 36.6855 1384.76 36.0241 1384.46 35.2961C1384.16 34.5681 1384 33.7879 1384 33C1384 32.2121 1384.16 31.4319 1384.46 30.7039C1384.76 29.9759 1385.2 29.3145 1385.76 28.7574C1386.32 28.2002 1386.98 27.7583 1387.71 27.4567C1388.44 27.1552 1389.22 27 1390 27C1391.6 27 1393.12 27.6321 1394.25 28.7574C1395.37 29.8826 1396 31.4087 1396 33C1396 34.5913 1395.37 36.1174 1394.25 37.2426C1393.12 38.3679 1391.6 39 1390 39V39ZM1390 37C1391.06 37 1392.08 36.5786 1392.83 35.8284C1393.58 35.0783 1394 34.0609 1394 33C1394 31.9391 1393.58 30.9217 1392.83 30.1716C1392.08 29.4214 1391.06 29 1390 29C1388.94 29 1387.93 29.4214 1387.18 30.1716C1386.43 30.9217 1386 31.9391 1386 33C1386 34.0609 1386.43 35.0783 1387.18 35.8284C1387.93 36.5786 1388.94 37 1390 37V37Z"
          fill="#1A1D1F"
        />
      </g>
    </g>
    <defs>
      <filter
        id="filter0_d_4867_2969"
        x={-4}
        y={-3}
        width={1448}
        height={84}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={1} />
        <feGaussianBlur stdDeviation={2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.6 0 0 0 0 0.607843 0 0 0 0 0.658824 0 0 0 0.12 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_4867_2969"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_4867_2969"
          result="shape"
        />
      </filter>
      <linearGradient
        id="paint0_linear_4867_2969"
        x1={50.0014}
        y1={19.4043}
        x2={50.0014}
        y2={56.5946}
        gradientUnits="userSpaceOnUse">
        <stop stopColor="#22AFFF" />
        <stop offset={1} stopColor="#1D41FF" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_4867_2969"
        x1={52.8885}
        y1={27.0508}
        x2={72.6872}
        y2={64.9419}
        gradientUnits="userSpaceOnUse">
        <stop stopColor="white" />
        <stop offset={1} stopColor="#192E5F" />
      </linearGradient>
      <clipPath id="clip0_4867_2969">
        <rect
          width={36}
          height={36}
          fill="white"
          transform="translate(32 20)"
        />
      </clipPath>
      <clipPath id="clip1_4867_2969">
        <rect
          width={24}
          height={24}
          fill="white"
          transform="translate(1282 26)"
        />
      </clipPath>
      <clipPath id="clip2_4867_2969">
        <rect
          width={24}
          height={24}
          fill="white"
          transform="translate(1330 26)"
        />
      </clipPath>
      <clipPath id="clip3_4867_2969">
        <rect
          width={24}
          height={24}
          fill="white"
          transform="translate(1378 26)"
        />
      </clipPath>
    </defs>
  </svg>
);

const Products = (props) => (
  <svg
    viewBox="0 0 1440 614"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}>
    <text
      fill="#272B30"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={24}
      fontWeight="bold"
      letterSpacing="0.01em">
      <tspan x={120} y={74.096}>
        {"New Arrivals"}
      </tspan>
    </text>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1249.91 63.2652C1249.5 62.8906 1248.87 62.9159 1248.5 63.3217L1245.27 66.8217C1244.91 67.2047 1244.91 67.7952 1245.27 68.1782L1248.5 71.6783C1248.87 72.0841 1249.5 72.1094 1249.91 71.7348C1250.31 71.3602 1250.34 70.7276 1249.97 70.3217L1248.28 68.5L1258 68.5C1258.55 68.5 1259 68.0523 1259 67.5C1259 66.9477 1258.55 66.5 1258 66.5L1248.28 66.5L1249.97 64.6783C1250.34 64.2725 1250.31 63.6398 1249.91 63.2652Z"
      fill="#777E91"
    />
    <rect
      x={1280.9}
      y={48.9}
      width={38.2}
      height={38.2}
      rx={19.1}
      stroke="#E6E8EC"
      strokeWidth={1.8}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1302.09 63.2652C1302.5 62.8906 1303.13 62.9159 1303.5 63.3217L1306.73 66.8217C1307.09 67.2047 1307.09 67.7952 1306.73 68.1782L1303.5 71.6783C1303.13 72.0841 1302.5 72.1094 1302.09 71.7348C1301.69 71.3602 1301.66 70.7276 1302.03 70.3217L1303.72 68.5L1294 68.5C1293.45 68.5 1293 68.0523 1293 67.5C1293 66.9477 1293.45 66.5 1294 66.5L1303.72 66.5L1302.03 64.6783C1301.66 64.2725 1301.69 63.6398 1302.09 63.2652Z"
      fill="#777E91"
    />
    <text
      fill="#6F767E"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={16}
      letterSpacing="0.01em">
      <tspan x={120} y={110.912}>
        {
          "We explore, discover, and express our unique style through the acquisition of extraordinary possessions"
        }
      </tspan>
    </text>
    <rect
      x={122}
      y={158}
      width={220}
      height={220}
      rx={12}
      fill="url(#pattern0_4867_3033)"
    />
    <text
      fill="#6F767E"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0em">
      <tspan x={122} y={409.173}>
        {"Men"}
      </tspan>
    </text>
    <text
      fill="#272B30"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0em">
      <tspan x={122} y={434.306}>
        {"Dunk Low Retro Now PL"}
      </tspan>
    </text>
    <g clipPath="url(#clip0_4867_3033)">
      <path
        d="M131 455.75L126.591 458.443L127.79 453.418L123.867 450.057L129.016 449.645L131 444.875L132.983 449.645L138.133 450.057L134.21 453.418L135.408 458.443L131 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip1_4867_3033)">
      <path
        d="M149 455.75L144.591 458.443L145.79 453.418L141.867 450.057L147.016 449.645L149 444.875L150.983 449.645L156.133 450.057L152.21 453.418L153.408 458.443L149 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip2_4867_3033)">
      <path
        d="M167 455.75L162.591 458.443L163.79 453.418L159.867 450.057L165.016 449.645L167 444.875L168.983 449.645L174.133 450.057L170.21 453.418L171.408 458.443L167 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip3_4867_3033)">
      <path
        d="M185 455.75L180.591 458.443L181.79 453.418L177.867 450.057L183.016 449.645L185 444.875L186.983 449.645L192.133 450.057L188.21 453.418L189.408 458.443L185 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip4_4867_3033)">
      <path
        d="M203 453.992L205.112 455.282L204.538 452.875L206.418 451.264L203.951 451.066L203 448.781V453.992ZM203 455.75L198.591 458.443L199.79 453.418L195.867 450.057L201.016 449.645L203 444.875L204.983 449.645L210.133 450.057L206.21 453.418L207.408 458.443L203 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <text
      fill="#353945"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0px">
      <tspan x={216} y={457.306}>
        {"4.5"}
      </tspan>
    </text>
    <text
      fill="#777E91"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0px">
      <tspan x={240} y={457.173}>
        {"(123)"}
      </tspan>
    </text>
    <text
      fill="#1A1D1F"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={16}
      letterSpacing="0em">
      <tspan x={122} y={486.064}>
        {"$29.09"}
      </tspan>
    </text>
    <g filter="url(#filter0_d_4867_3033)">
      <rect
        x={302}
        y={164}
        width={30}
        height={30}
        rx={15}
        fill="white"
        shapeRendering="crispEdges"
      />
      <g clipPath="url(#clip5_4867_3033)">
        <path
          d="M322.251 180.5V182.75H324.501V184.25H322.25L322.251 186.5H320.751L320.75 184.25H318.501V182.75H320.751V180.5H322.251ZM323.183 173.568C324.88 175.269 324.938 177.978 323.36 179.744L322.295 178.68C323.293 177.537 323.241 175.745 322.121 174.627C320.994 173.503 319.181 173.455 318.004 174.513L317.002 175.411L316 174.513C314.819 173.454 313.007 173.501 311.88 174.629C310.762 175.746 310.706 177.535 311.736 178.717L318.06 185.052L317.001 186.114L310.641 179.745C309.063 177.978 309.122 175.264 310.818 173.568C312.517 171.87 315.234 171.813 317.001 173.397C318.763 171.815 321.485 171.867 323.182 173.568H323.183Z"
          fill="#6F767E"
        />
      </g>
    </g>
    <rect
      x={366}
      y={158}
      width={220}
      height={220}
      rx={12}
      fill="url(#pattern1_4867_3033)"
    />
    <text
      fill="#6F767E"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0em">
      <tspan x={366} y={409.173}>
        {"Women"}
      </tspan>
    </text>
    <text
      fill="#272B30"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0em">
      <tspan x={366} y={434.306}>
        {"Low By You"}
      </tspan>
    </text>
    <g clipPath="url(#clip6_4867_3033)">
      <path
        d="M375 455.75L370.591 458.443L371.79 453.418L367.867 450.057L373.016 449.645L375 444.875L376.983 449.645L382.133 450.057L378.21 453.418L379.408 458.443L375 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip7_4867_3033)">
      <path
        d="M393 455.75L388.591 458.443L389.79 453.418L385.867 450.057L391.016 449.645L393 444.875L394.983 449.645L400.133 450.057L396.21 453.418L397.408 458.443L393 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip8_4867_3033)">
      <path
        d="M411 455.75L406.591 458.443L407.79 453.418L403.867 450.057L409.016 449.645L411 444.875L412.983 449.645L418.133 450.057L414.21 453.418L415.408 458.443L411 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip9_4867_3033)">
      <path
        d="M429 455.75L424.591 458.443L425.79 453.418L421.867 450.057L427.016 449.645L429 444.875L430.983 449.645L436.133 450.057L432.21 453.418L433.408 458.443L429 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip10_4867_3033)">
      <path
        d="M447 453.992L449.112 455.282L448.538 452.875L450.418 451.264L447.951 451.066L447 448.781V453.992ZM447 455.75L442.591 458.443L443.79 453.418L439.867 450.057L445.016 449.645L447 444.875L448.983 449.645L454.133 450.057L450.21 453.418L451.408 458.443L447 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <text
      fill="#353945"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0px">
      <tspan x={460} y={457.306}>
        {"4.5"}
      </tspan>
    </text>
    <text
      fill="#777E91"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0px">
      <tspan x={484} y={457.173}>
        {"(123)"}
      </tspan>
    </text>
    <text
      fill="#1A1D1F"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={16}
      letterSpacing="0em">
      <tspan x={366} y={486.064}>
        {"$189.58"}
      </tspan>
    </text>
    <text
      fill="#6F767E"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={16}
      letterSpacing="0em"
      textDecoration="line-through">
      <tspan x={432} y={485.912}>
        {"$235.00"}
      </tspan>
    </text>
    <text
      fill="#FF6A55"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={16}
      letterSpacing="0em">
      <tspan x={498} y={485.912}>
        {"-12%"}
      </tspan>
    </text>
    <g filter="url(#filter1_d_4867_3033)">
      <rect
        x={546}
        y={164}
        width={30}
        height={30}
        rx={15}
        fill="white"
        shapeRendering="crispEdges"
      />
      <g clipPath="url(#clip11_4867_3033)">
        <path
          d="M566.251 180.5V182.75H568.501V184.25H566.25L566.251 186.5H564.751L564.75 184.25H562.501V182.75H564.751V180.5H566.251ZM567.183 173.568C568.88 175.269 568.938 177.978 567.36 179.744L566.295 178.68C567.293 177.537 567.241 175.745 566.121 174.627C564.994 173.503 563.181 173.455 562.004 174.513L561.002 175.411L560 174.513C558.819 173.454 557.007 173.501 555.88 174.629C554.762 175.746 554.706 177.535 555.736 178.717L562.06 185.052L561.001 186.114L554.641 179.745C553.063 177.978 553.122 175.264 554.818 173.568C556.517 171.87 559.234 171.813 561.001 173.397C562.763 171.815 565.485 171.867 567.182 173.568H567.183Z"
          fill="#6F767E"
        />
      </g>
    </g>
    <rect x={610} y={158} width={220} height={220} rx={12} fill="#F8F8F8" />
    <rect
      x={610}
      y={158}
      width={220}
      height={220}
      rx={12}
      fill="url(#pattern2_4867_3033)"
    />
    <text
      fill="#6F767E"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0em">
      <tspan x={610} y={409.173}>
        {"Kids"}
      </tspan>
    </text>
    <text
      fill="#272B30"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0em">
      <tspan x={610} y={434.306}>
        {"Dunk Low Retro SE"}
      </tspan>
    </text>
    <g clipPath="url(#clip12_4867_3033)">
      <path
        d="M619 455.75L614.591 458.443L615.79 453.418L611.867 450.057L617.016 449.645L619 444.875L620.983 449.645L626.133 450.057L622.21 453.418L623.408 458.443L619 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip13_4867_3033)">
      <path
        d="M637 455.75L632.591 458.443L633.79 453.418L629.867 450.057L635.016 449.645L637 444.875L638.983 449.645L644.133 450.057L640.21 453.418L641.408 458.443L637 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip14_4867_3033)">
      <path
        d="M655 455.75L650.591 458.443L651.79 453.418L647.867 450.057L653.016 449.645L655 444.875L656.983 449.645L662.133 450.057L658.21 453.418L659.408 458.443L655 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip15_4867_3033)">
      <path
        d="M673 455.75L668.591 458.443L669.79 453.418L665.867 450.057L671.016 449.645L673 444.875L674.983 449.645L680.133 450.057L676.21 453.418L677.408 458.443L673 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip16_4867_3033)">
      <path
        d="M691 453.992L693.112 455.282L692.538 452.875L694.418 451.264L691.951 451.066L691 448.781V453.992ZM691 455.75L686.591 458.443L687.79 453.418L683.867 450.057L689.016 449.645L691 444.875L692.983 449.645L698.133 450.057L694.21 453.418L695.408 458.443L691 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <text
      fill="#353945"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0px">
      <tspan x={704} y={457.306}>
        {"4.5"}
      </tspan>
    </text>
    <text
      fill="#777E91"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0px">
      <tspan x={728} y={457.173}>
        {"(123)"}
      </tspan>
    </text>
    <text
      fill="#1A1D1F"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={16}
      letterSpacing="0em">
      <tspan x={610} y={486.064}>
        {"$39.89"}
      </tspan>
    </text>
    <g filter="url(#filter2_d_4867_3033)">
      <rect
        x={790}
        y={164}
        width={30}
        height={30}
        rx={15}
        fill="white"
        shapeRendering="crispEdges"
      />
      <g clipPath="url(#clip17_4867_3033)">
        <path
          d="M810.251 180.5V182.75H812.501V184.25H810.25L810.251 186.5H808.751L808.75 184.25H806.501V182.75H808.751V180.5H810.251ZM811.183 173.568C812.88 175.269 812.938 177.978 811.36 179.744L810.295 178.68C811.293 177.537 811.241 175.745 810.121 174.627C808.994 173.503 807.181 173.455 806.004 174.513L805.002 175.411L804 174.513C802.819 173.454 801.007 173.501 799.88 174.629C798.762 175.746 798.706 177.535 799.736 178.717L806.06 185.052L805.001 186.114L798.641 179.745C797.063 177.978 797.122 175.264 798.818 173.568C800.517 171.87 803.234 171.813 805.001 173.397C806.763 171.815 809.485 171.867 811.182 173.568H811.183Z"
          fill="#6F767E"
        />
      </g>
    </g>
    <rect
      x={854}
      y={158}
      width={220}
      height={220}
      rx={12}
      fill="url(#pattern3_4867_3033)"
    />
    <text
      fill="#6F767E"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0em">
      <tspan x={854} y={409.173}>
        {"Women"}
      </tspan>
    </text>
    <text
      fill="#272B30"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0em">
      <tspan x={854} y={434.306}>
        {"Low Green SE"}
      </tspan>
    </text>
    <g clipPath="url(#clip18_4867_3033)">
      <path
        d="M863 455.75L858.591 458.443L859.79 453.418L855.867 450.057L861.016 449.645L863 444.875L864.983 449.645L870.133 450.057L866.21 453.418L867.408 458.443L863 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip19_4867_3033)">
      <path
        d="M881 455.75L876.591 458.443L877.79 453.418L873.867 450.057L879.016 449.645L881 444.875L882.983 449.645L888.133 450.057L884.21 453.418L885.408 458.443L881 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip20_4867_3033)">
      <path
        d="M899 455.75L894.591 458.443L895.79 453.418L891.867 450.057L897.016 449.645L899 444.875L900.983 449.645L906.133 450.057L902.21 453.418L903.408 458.443L899 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip21_4867_3033)">
      <path
        d="M917 455.75L912.591 458.443L913.79 453.418L909.867 450.057L915.016 449.645L917 444.875L918.983 449.645L924.133 450.057L920.21 453.418L921.408 458.443L917 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip22_4867_3033)">
      <path
        d="M935 453.992L937.112 455.282L936.538 452.875L938.418 451.264L935.951 451.066L935 448.781V453.992ZM935 455.75L930.591 458.443L931.79 453.418L927.867 450.057L933.016 449.645L935 444.875L936.983 449.645L942.133 450.057L938.21 453.418L939.408 458.443L935 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <text
      fill="#353945"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0px">
      <tspan x={948} y={457.306}>
        {"4.5"}
      </tspan>
    </text>
    <text
      fill="#777E91"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0px">
      <tspan x={972} y={457.173}>
        {"(123)"}
      </tspan>
    </text>
    <text
      fill="#1A1D1F"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={16}
      letterSpacing="0em">
      <tspan x={854} y={486.064}>
        {"$39.89"}
      </tspan>
    </text>
    <g filter="url(#filter3_d_4867_3033)">
      <rect
        x={1034}
        y={164}
        width={30}
        height={30}
        rx={15}
        fill="white"
        shapeRendering="crispEdges"
      />
      <g clipPath="url(#clip23_4867_3033)">
        <path
          d="M1054.25 180.5V182.75H1056.5V184.25H1054.25L1054.25 186.5H1052.75L1052.75 184.25H1050.5V182.75H1052.75V180.5H1054.25ZM1055.18 173.568C1056.88 175.269 1056.94 177.978 1055.36 179.744L1054.3 178.68C1055.29 177.537 1055.24 175.745 1054.12 174.627C1052.99 173.503 1051.18 173.455 1050 174.513L1049 175.411L1048 174.513C1046.82 173.454 1045.01 173.501 1043.88 174.629C1042.76 175.746 1042.71 177.535 1043.74 178.717L1050.06 185.052L1049 186.114L1042.64 179.745C1041.06 177.978 1041.12 175.264 1042.82 173.568C1044.52 171.87 1047.23 171.813 1049 173.397C1050.76 171.815 1053.49 171.867 1055.18 173.568H1055.18Z"
          fill="#6F767E"
        />
      </g>
    </g>
    <rect
      x={1098}
      y={158}
      width={220}
      height={220}
      rx={12}
      fill="url(#pattern4_4867_3033)"
    />
    <text
      fill="#6F767E"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0em">
      <tspan x={1098} y={409.173}>
        {"Women"}
      </tspan>
    </text>
    <text
      fill="#272B30"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0em">
      <tspan x={1098} y={434.306}>
        {"Retro SE"}
      </tspan>
    </text>
    <g clipPath="url(#clip24_4867_3033)">
      <path
        d="M1107 455.75L1102.59 458.443L1103.79 453.418L1099.87 450.057L1105.02 449.645L1107 444.875L1108.98 449.645L1114.13 450.057L1110.21 453.418L1111.41 458.443L1107 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip25_4867_3033)">
      <path
        d="M1125 455.75L1120.59 458.443L1121.79 453.418L1117.87 450.057L1123.02 449.645L1125 444.875L1126.98 449.645L1132.13 450.057L1128.21 453.418L1129.41 458.443L1125 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip26_4867_3033)">
      <path
        d="M1143 455.75L1138.59 458.443L1139.79 453.418L1135.87 450.057L1141.02 449.645L1143 444.875L1144.98 449.645L1150.13 450.057L1146.21 453.418L1147.41 458.443L1143 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip27_4867_3033)">
      <path
        d="M1161 455.75L1156.59 458.443L1157.79 453.418L1153.87 450.057L1159.02 449.645L1161 444.875L1162.98 449.645L1168.13 450.057L1164.21 453.418L1165.41 458.443L1161 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <g clipPath="url(#clip28_4867_3033)">
      <path
        d="M1179 453.992L1181.11 455.282L1180.54 452.875L1182.42 451.264L1179.95 451.066L1179 448.781V453.992ZM1179 455.75L1174.59 458.443L1175.79 453.418L1171.87 450.057L1177.02 449.645L1179 444.875L1180.98 449.645L1186.13 450.057L1182.21 453.418L1183.41 458.443L1179 455.75Z"
        fill="#FDB92C"
      />
    </g>
    <text
      fill="#353945"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0px">
      <tspan x={1192} y={457.306}>
        {"4.5"}
      </tspan>
    </text>
    <text
      fill="#777E91"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0px">
      <tspan x={1216} y={457.173}>
        {"(123)"}
      </tspan>
    </text>
    <text
      fill="#1A1D1F"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={16}
      letterSpacing="0em">
      <tspan x={1098} y={486.064}>
        {"$290.39"}
      </tspan>
    </text>
    <g filter="url(#filter4_d_4867_3033)">
      <rect
        x={1278}
        y={164}
        width={30}
        height={30}
        rx={15}
        fill="white"
        shapeRendering="crispEdges"
      />
      <g clipPath="url(#clip29_4867_3033)">
        <path
          d="M1298.25 180.5V182.75H1300.5V184.25H1298.25L1298.25 186.5H1296.75L1296.75 184.25H1294.5V182.75H1296.75V180.5H1298.25ZM1299.18 173.568C1300.88 175.269 1300.94 177.978 1299.36 179.744L1298.3 178.68C1299.29 177.537 1299.24 175.745 1298.12 174.627C1296.99 173.503 1295.18 173.455 1294 174.513L1293 175.411L1292 174.513C1290.82 173.454 1289.01 173.501 1287.88 174.629C1286.76 175.746 1286.71 177.535 1287.74 178.717L1294.06 185.052L1293 186.114L1286.64 179.745C1285.06 177.978 1285.12 175.264 1286.82 173.568C1288.52 171.87 1291.23 171.813 1293 173.397C1294.76 171.815 1297.49 171.867 1299.18 173.568H1299.18Z"
          fill="#6F767E"
        />
      </g>
    </g>
    <rect
      x={667.5}
      y={526.5}
      width={105}
      height={39}
      rx={11.5}
      stroke="#EFEFEF"
    />
    <text
      fill="#272B30"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={14}
      letterSpacing="0em">
      <tspan x={683} y={551.306}>
        {"View all"}
      </tspan>
    </text>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M751.091 541.265C751.497 540.891 752.129 540.916 752.504 541.322L755.735 544.822C756.088 545.205 756.088 545.795 755.735 546.178L752.504 549.678C752.129 550.084 751.497 550.109 751.091 549.735C750.685 549.36 750.66 548.728 751.034 548.322L752.716 546.5L743 546.5C742.448 546.5 742 546.052 742 545.5C742 544.948 742.448 544.5 743 544.5L752.716 544.5L751.034 542.678C750.66 542.272 750.685 541.64 751.091 541.265Z"
      fill="#777E91"
    />
    <defs>
      <pattern
        id="pattern0_4867_3033"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}>
        <use xlinkHref="#image0_4867_3033" transform="scale(0.00168919)" />
      </pattern>
      <filter
        id="filter0_d_4867_3033"
        x={298}
        y={161}
        width={38}
        height={38}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={1} />
        <feGaussianBlur stdDeviation={2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.6 0 0 0 0 0.607843 0 0 0 0 0.658824 0 0 0 0.24 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_4867_3033"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_4867_3033"
          result="shape"
        />
      </filter>
      <pattern
        id="pattern1_4867_3033"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}>
        <use xlinkHref="#image1_4867_3033" transform="scale(0.00168919)" />
      </pattern>
      <filter
        id="filter1_d_4867_3033"
        x={542}
        y={161}
        width={38}
        height={38}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={1} />
        <feGaussianBlur stdDeviation={2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.6 0 0 0 0 0.607843 0 0 0 0 0.658824 0 0 0 0.24 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_4867_3033"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_4867_3033"
          result="shape"
        />
      </filter>
      <pattern
        id="pattern2_4867_3033"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}>
        <use xlinkHref="#image2_4867_3033" transform="scale(0.00168919)" />
      </pattern>
      <filter
        id="filter2_d_4867_3033"
        x={786}
        y={161}
        width={38}
        height={38}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={1} />
        <feGaussianBlur stdDeviation={2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.6 0 0 0 0 0.607843 0 0 0 0 0.658824 0 0 0 0.24 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_4867_3033"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_4867_3033"
          result="shape"
        />
      </filter>
      <pattern
        id="pattern3_4867_3033"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}>
        <use xlinkHref="#image3_4867_3033" transform="scale(0.00168919)" />
      </pattern>
      <filter
        id="filter3_d_4867_3033"
        x={1030}
        y={161}
        width={38}
        height={38}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={1} />
        <feGaussianBlur stdDeviation={2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.6 0 0 0 0 0.607843 0 0 0 0 0.658824 0 0 0 0.24 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_4867_3033"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_4867_3033"
          result="shape"
        />
      </filter>
      <pattern
        id="pattern4_4867_3033"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}>
        <use xlinkHref="#image4_4867_3033" transform="scale(0.00168919)" />
      </pattern>
      <filter
        id="filter4_d_4867_3033"
        x={1274}
        y={161}
        width={38}
        height={38}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={1} />
        <feGaussianBlur stdDeviation={2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.6 0 0 0 0 0.607843 0 0 0 0 0.658824 0 0 0 0.24 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_4867_3033"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_4867_3033"
          result="shape"
        />
      </filter>
      <clipPath id="clip0_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(122 443)"
        />
      </clipPath>
      <clipPath id="clip1_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(140 443)"
        />
      </clipPath>
      <clipPath id="clip2_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(158 443)"
        />
      </clipPath>
      <clipPath id="clip3_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(176 443)"
        />
      </clipPath>
      <clipPath id="clip4_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(194 443)"
        />
      </clipPath>
      <clipPath id="clip5_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(308 170)"
        />
      </clipPath>
      <clipPath id="clip6_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(366 443)"
        />
      </clipPath>
      <clipPath id="clip7_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(384 443)"
        />
      </clipPath>
      <clipPath id="clip8_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(402 443)"
        />
      </clipPath>
      <clipPath id="clip9_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(420 443)"
        />
      </clipPath>
      <clipPath id="clip10_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(438 443)"
        />
      </clipPath>
      <clipPath id="clip11_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(552 170)"
        />
      </clipPath>
      <clipPath id="clip12_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(610 443)"
        />
      </clipPath>
      <clipPath id="clip13_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(628 443)"
        />
      </clipPath>
      <clipPath id="clip14_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(646 443)"
        />
      </clipPath>
      <clipPath id="clip15_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(664 443)"
        />
      </clipPath>
      <clipPath id="clip16_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(682 443)"
        />
      </clipPath>
      <clipPath id="clip17_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(796 170)"
        />
      </clipPath>
      <clipPath id="clip18_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(854 443)"
        />
      </clipPath>
      <clipPath id="clip19_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(872 443)"
        />
      </clipPath>
      <clipPath id="clip20_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(890 443)"
        />
      </clipPath>
      <clipPath id="clip21_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(908 443)"
        />
      </clipPath>
      <clipPath id="clip22_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(926 443)"
        />
      </clipPath>
      <clipPath id="clip23_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(1040 170)"
        />
      </clipPath>
      <clipPath id="clip24_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(1098 443)"
        />
      </clipPath>
      <clipPath id="clip25_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(1116 443)"
        />
      </clipPath>
      <clipPath id="clip26_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(1134 443)"
        />
      </clipPath>
      <clipPath id="clip27_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(1152 443)"
        />
      </clipPath>
      <clipPath id="clip28_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(1170 443)"
        />
      </clipPath>
      <clipPath id="clip29_4867_3033">
        <rect
          width={18}
          height={18}
          fill="white"
          transform="translate(1284 170)"
        />
      </clipPath>
      <image
        id="image0_4867_3033"
        width={592}
        height={592}
        href="/img/Vector-1.webp"
      />
      <image
        id="image1_4867_3033"
        width={592}
        height={592}
        href="/img/Vector-2.webp"
      />
      <image
        id="image2_4867_3033"
        width={592}
        height={592}
        href="/img/Vector-3.webp"
      />
      <image
        id="image3_4867_3033"
        width={592}
        height={592}
        href="/img/Vector-4.webp"
      />
      <image
        id="image4_4867_3033"
        width={592}
        height={592}
        href="/img/Vector.webp"
      />
    </defs>
  </svg>
);

const Articles = (props) => (
  <svg
    viewBox="0 0 1440 538"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}>
    <text
      fill="#070304"
      xmlSpace="preserve"
      style={{
        whiteSpace: "pre",
      }}
      fontSize={24}
      fontWeight="bold"
      letterSpacing="0.01em">
      <tspan x={120} y={74.096}>
        {"Articles"}
      </tspan>
    </text>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1249.91 63.2652C1249.5 62.8906 1248.87 62.9159 1248.5 63.3217L1245.27 66.8217C1244.91 67.2047 1244.91 67.7952 1245.27 68.1782L1248.5 71.6783C1248.87 72.0841 1249.5 72.1094 1249.91 71.7348C1250.31 71.3602 1250.34 70.7276 1249.97 70.3217L1248.28 68.5L1258 68.5C1258.55 68.5 1259 68.0523 1259 67.5C1259 66.9477 1258.55 66.5 1258 66.5L1248.28 66.5L1249.97 64.6783C1250.34 64.2725 1250.31 63.6398 1249.91 63.2652Z"
      fill="#777E91"
    />
    <rect
      x={1281}
      y={49}
      width={38}
      height={38}
      rx={19}
      stroke="#E6E8EC"
      strokeWidth={2}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1302.09 63.2652C1302.5 62.8906 1303.13 62.9159 1303.5 63.3217L1306.73 66.8217C1307.09 67.2047 1307.09 67.7952 1306.73 68.1782L1303.5 71.6783C1303.13 72.0841 1302.5 72.1094 1302.09 71.7348C1301.69 71.3602 1301.66 70.7276 1302.03 70.3217L1303.72 68.5L1294 68.5C1293.45 68.5 1293 68.0523 1293 67.5C1293 66.9477 1293.45 66.5 1294 66.5L1303.72 66.5L1302.03 64.6783C1301.66 64.2725 1301.69 63.6398 1302.09 63.2652Z"
      fill="#777E91"
    />
    <g filter="url(#filter0_d_4867_3067)">
      <rect x={120} y={120} width={384} height={358} rx={12} fill="white" />
      <rect
        x={140}
        y={140}
        width={344}
        height={168}
        rx={8}
        fill="url(#pattern0_4867_3067)"
      />
      <text
        fill="#272B30"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={16}
        fontWeight="bold"
        letterSpacing="0px">
        <tspan x={142} y={346.064}>
          {"Discover "}
        </tspan>
      </text>
      <text
        fill="#272B30"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={16}
        fontWeight="bold"
        letterSpacing="0px">
        <tspan x={213.719} y={346.064}>
          {"the new seasons shoe trends for "}
        </tspan>
        <tspan x={142} y={370.064}>
          {"2024"}
        </tspan>
      </text>
      <text
        fill="#6F767E"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={14}
        letterSpacing="0px">
        <tspan x={142} y={396.173}>
          {"From sleek sneakers to elegant heels, 2024 is shaping "}
        </tspan>
        <tspan x={142} y={418.173}>
          {"up to be a year of bold and innovative shoe designs."}
        </tspan>
      </text>
      <text
        fill="#2A85FF"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={14}
        letterSpacing="0px"
        textDecoration="underline">
        <tspan x={142} y={452.306}>
          {"See more details"}
        </tspan>
      </text>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M265.915 442.659C266.287 442.316 266.867 442.339 267.211 442.711L270.172 445.919C270.496 446.27 270.496 446.812 270.172 447.163L267.211 450.371C266.867 450.743 266.287 450.766 265.915 450.423C265.543 450.08 265.52 449.5 265.864 449.128L267.405 447.458L258.499 447.458C257.992 447.458 257.582 447.047 257.582 446.541C257.582 446.035 257.992 445.624 258.499 445.624L267.405 445.624L265.864 443.954C265.52 443.582 265.543 443.003 265.915 442.659Z"
        fill="#2A85FF"
      />
    </g>
    <g filter="url(#filter1_d_4867_3067)">
      <rect x={528} y={120} width={384} height={358} rx={12} fill="white" />
      <rect
        x={548}
        y={140}
        width={344}
        height={168}
        rx={8}
        fill="url(#pattern1_4867_3067)"
      />
      <text
        fill="#272B30"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={16}
        fontWeight="bold"
        letterSpacing="0px">
        <tspan x={550} y={346.064}>
          {"The "}
        </tspan>
      </text>
      <text
        fill="#272B30"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={16}
        fontWeight="bold"
        letterSpacing="0px">
        <tspan x={582.906} y={346.064}>
          {"perfect shoe for every occasion: a "}
        </tspan>
        <tspan x={550} y={370.064}>
          {"complete guide"}
        </tspan>
      </text>
      <text
        fill="#6F767E"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={14}
        letterSpacing="0px">
        <tspan x={550} y={396.173}>
          {"Whether you're dressing for a formal event or a casual "}
        </tspan>
        <tspan x={550} y={418.173}>
          {"day out, choosing the right pair of shoes."}
        </tspan>
      </text>
      <text
        fill="#2A85FF"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={14}
        letterSpacing="0px"
        textDecoration="underline">
        <tspan x={550} y={452.306}>
          {"See more details"}
        </tspan>
      </text>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M673.915 442.659C674.287 442.316 674.867 442.339 675.211 442.711L678.172 445.919C678.496 446.27 678.496 446.812 678.172 447.163L675.211 450.371C674.867 450.743 674.287 450.766 673.915 450.423C673.543 450.08 673.52 449.5 673.864 449.128L675.405 447.458L666.499 447.458C665.992 447.458 665.582 447.047 665.582 446.541C665.582 446.035 665.992 445.624 666.499 445.624L675.405 445.624L673.864 443.954C673.52 443.582 673.543 443.003 673.915 442.659Z"
        fill="#2A85FF"
      />
    </g>
    <g filter="url(#filter2_d_4867_3067)">
      <rect x={936} y={120} width={384} height={358} rx={12} fill="white" />
      <rect
        x={956}
        y={140}
        width={344}
        height={168}
        rx={8}
        fill="url(#pattern2_4867_3067)"
      />
      <text
        fill="#272B30"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={16}
        fontWeight="bold"
        letterSpacing="0px">
        <tspan x={958} y={346.064}>
          {"Sustainable "}
        </tspan>
      </text>
      <text
        fill="#272B30"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={16}
        fontWeight="bold"
        letterSpacing="0px">
        <tspan x={1051.62} y={346.064}>
          {"shoes: how eco-friendly "}
        </tspan>
        <tspan x={958} y={370.064}>
          {"footwear is changing fashion"}
        </tspan>
      </text>
      <text
        fill="#6F767E"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={14}
        letterSpacing="0px">
        <tspan x={958} y={396.173}>
          {"Eco-conscious consumers are driving the demand for "}
        </tspan>
        <tspan x={958} y={418.173}>
          {"sustainable shoes made from recycled materials."}
        </tspan>
      </text>
      <text
        fill="#2A85FF"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontSize={14}
        letterSpacing="0px"
        textDecoration="underline">
        <tspan x={958} y={452.306}>
          {"See more details"}
        </tspan>
      </text>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1081.92 442.659C1082.29 442.316 1082.87 442.339 1083.21 442.711L1086.17 445.919C1086.5 446.27 1086.5 446.812 1086.17 447.163L1083.21 450.371C1082.87 450.743 1082.29 450.766 1081.92 450.423C1081.54 450.08 1081.52 449.5 1081.86 449.128L1083.41 447.458L1074.5 447.458C1073.99 447.458 1073.58 447.047 1073.58 446.541C1073.58 446.035 1073.99 445.624 1074.5 445.624L1083.41 445.624L1081.86 443.954C1081.52 443.582 1081.54 443.003 1081.92 442.659Z"
        fill="#2A85FF"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_4867_3067"
        x={116}
        y={117}
        width={392}
        height={366}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={1} />
        <feGaussianBlur stdDeviation={2} />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.6 0 0 0 0 0.607843 0 0 0 0 0.658824 0 0 0 0.12 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_4867_3067"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_4867_3067"
          result="shape"
        />
      </filter>
      <pattern
        id="pattern0_4867_3067"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}>
        <use
          xlinkHref="#image0_4867_3067"
          transform="matrix(0.00120773 0 0 0.00247297 0 -0.18254)"
        />
      </pattern>
      <filter
        id="filter1_d_4867_3067"
        x={524}
        y={117}
        width={392}
        height={366}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={1} />
        <feGaussianBlur stdDeviation={2} />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.6 0 0 0 0 0.607843 0 0 0 0 0.658824 0 0 0 0.12 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_4867_3067"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_4867_3067"
          result="shape"
        />
      </filter>
      <pattern
        id="pattern1_4867_3067"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}>
        <use
          xlinkHref="#image1_4867_3067"
          transform="matrix(0.00120773 0 0 0.00247297 0 -0.18254)"
        />
      </pattern>
      <filter
        id="filter2_d_4867_3067"
        x={932}
        y={117}
        width={392}
        height={366}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={1} />
        <feGaussianBlur stdDeviation={2} />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.6 0 0 0 0 0.607843 0 0 0 0 0.658824 0 0 0 0.12 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_4867_3067"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_4867_3067"
          result="shape"
        />
      </filter>
      <pattern
        id="pattern2_4867_3067"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}>
        <use
          xlinkHref="#image2_4867_3067"
          transform="matrix(0.00120773 0 0 0.00247297 0 -0.18254)"
        />
      </pattern>
      <image
        id="image0_4867_3067"
        width={828}
        height={552}
        href="/img/Vector-5.webp"
      />
      <image
        id="image1_4867_3067"
        width={828}
        height={552}
        href="/img/Vector-6.webp"
      />
      <image
        id="image2_4867_3067"
        width={828}
        height={552}
        href="/img/Vector-7.webp"
      />
    </defs>
  </svg>
);

const BuilderSVG = () => {
  const [reversing, setReversing] = React.useState(false);
  const [hideSetting, setHideSetting] = React.useState(false);
  const timeout = React.useRef(null);
  const startRef = useSpringRef();
  // Start with the entire block slide up from the bottom
  const startSprings = useSpring({
    ref: startRef,
    from: {
      opacity: reversing ? 1 : 0,
      transform: reversing ? "translateY(0px)" : "translateY(20px)",
    },
    to: [
      {
        opacity: reversing ? 0 : 1,
        transform: reversing ? "translateY(20px)" : "translateY(0px)",
      },
    ],
    onResume: () => {
      setReversing(!reversing);
      startRef.start();
    },
  });

  const settingRef = useSpringRef();
  // Start with the entire block slide up from the bottom
  const settingSprings = useSpring({
    ref: settingRef,
    from: {
      opacity: reversing || hideSetting ? 1 : 0,
      transform:
        reversing || hideSetting ? "translateY(0px)" : "translateY(20px)",
    },
    to: {
      opacity: reversing || hideSetting ? 0 : 1,
      transform:
        reversing || hideSetting ? "translateY(20px)" : "translateY(0px)",
    },
  });

  const productsSettingRef = useSpringRef();
  // Start with the entire block slide up from the bottom
  const productsSettingSprings = useSpring({
    ref: productsSettingRef,
    from: {
      opacity: reversing ? 1 : 0,
      transform: reversing ? "translateY(0px)" : "translateY(20px)",
    },
    to: {
      opacity: reversing ? 0 : 1,
      transform: reversing ? "translateY(20px)" : "translateY(0px)",
    },
    config: { duration: reversing ? 0 : 500 },
  });

  const articlesSettingRef = useSpringRef();
  // Start with the entire block slide up from the bottom
  const articlesSettingSprings = useSpring({
    ref: articlesSettingRef,
    from: {
      opacity: reversing ? 1 : 0,
      transform: reversing ? "translateY(0px)" : "translateY(20px)",
    },
    to: {
      opacity: reversing ? 0 : 1,
      transform: reversing ? "translateY(20px)" : "translateY(0px)",
    },
    config: { duration: reversing ? 0 : 500 },
  });

  const productStatusBackgroundRef = useSpringRef();
  const productStatusBackgroundSprings = useSpring({
    ref: productStatusBackgroundRef,
    from: { backgroundColor: reversing ? "#008060" : "#F2F4F7" },
    to: { backgroundColor: reversing ? "#F2F4F7" : "#008060" },
    config: { duration: reversing ? 0 : 500 },
  });

  const productsStatusPositionRef = useSpringRef();
  const productsStatusPositionSprings = useSpring({
    ref: productsStatusPositionRef,
    from: { left: reversing ? "50%" : "0%" },
    to: { left: reversing ? "0%" : "50%" },
    config: { duration: reversing ? 0 : 500 },
  });

  const articlesStatusBackgroundRef = useSpringRef();
  const articlesStatusBackgroundSprings = useSpring({
    ref: articlesStatusBackgroundRef,
    from: { backgroundColor: reversing ? "#008060" : "#F2F4F7" },
    to: { backgroundColor: reversing ? "#F2F4F7" : "#008060" },
    config: { duration: reversing ? 0 : 500 },
  });

  const articlesStatusPositionRef = useSpringRef();
  const articlesStatusPositionSprings = useSpring({
    ref: articlesStatusPositionRef,
    from: { left: reversing ? "50%" : "0%" },
    to: { left: reversing ? "0%" : "50%" },
    config: { duration: reversing ? 0 : 500 },
  });

  const productsBorderRef = useSpringRef();
  const productsBorderSprings = useSpring({
    ref: productsBorderRef,
    from: { opacity: reversing ? 1 : 0 },
    to: {
      opacity: reversing ? 0 : 1,
      transform: reversing ? "scale(0)" : "scale(1)",
    },
    config: { duration: reversing ? 0 : 500 },
  });

  const productsRef = useSpringRef();
  const productsSprings = useSpring({
    ref: productsRef,
    from: { opacity: reversing ? 1 : 0 },
    to: { opacity: reversing ? 0 : 1 },
    config: { duration: reversing ? 0 : 500 },
  });
  const articlesBorderRef = useSpringRef();
  const articlesBorderSprings = useSpring({
    ref: articlesBorderRef,
    from: { opacity: reversing ? 1 : 0 },
    to: {
      opacity: reversing ? 0 : 1,
      transform: reversing ? "scale(0)" : "scale(1)",
    },
    config: { duration: reversing ? 0 : 500 },
  });
  const articlessRef = useSpringRef();
  const articlesSprings = useSpring({
    ref: articlessRef,
    from: { opacity: reversing ? 1 : 0 },
    to: { opacity: reversing ? 0 : 1 },
    config: { duration: reversing ? 0 : 500 },
    onRest: () => {
      setHideSetting(true);
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      timeout.current = setTimeout(
        () => {
          setReversing(!reversing);
          startRef.start();
        },
        reversing ? 200 : 2500
      );
    },
  });

  useEffect(() => {
    if (!reversing) {
      setHideSetting(false);
    }
  }, [reversing]);

  useChain([
    startRef,
    productsBorderRef,
    settingRef,
    productsBorderRef,
    productsSettingRef,
    productStatusBackgroundRef,
    productsStatusPositionRef,
    productsRef,
    articlesBorderRef,
    articlesSettingRef,
    articlesStatusBackgroundRef,
    articlesStatusPositionRef,
    articlessRef,
  ]);

  return (
    <div className="dynamic-content">
      <animated.div
        className="builder bg-white rounded-t-2xl"
        style={startSprings}>
        <div>
          <Header />
        </div>
        <animated.div
          className={"shadow-[inset_0_0_3px_#008060] bg-[#e5fff938]"}
          style={productsBorderSprings}>
          <animated.div style={productsSprings} className={"bg-white"}>
            <Products />
          </animated.div>
        </animated.div>
        <animated.div
          className={"shadow-[inset_0_0_3px_#008060] bg-[#e5fff938]"}
          style={articlesBorderSprings}>
          <animated.div style={articlesSprings} className={"bg-white"}>
            <Articles />
          </animated.div>
        </animated.div>
      </animated.div>
      <animated.div
        className="md:w-80 p-4 md:p-6 bg-white rounded-t-2xl setting"
        style={settingSprings}>
        <div className="grid grid-cols-1 gap-3 md:gap-5">
          <div className="flex justify-start items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none">
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="#101828"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-medium text-sm md:text-base text-Neutrals-01">
              Main Menu
            </span>
          </div>
          <div className="flex justify-start items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none">
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="#101828"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-medium text-sm md:text-base text-Neutrals-01">
              Hero Banners
            </span>
          </div>
          <animated.div style={productsSettingSprings}>
            <div className="flex justify-start items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none">
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="#101828"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-medium text-sm md:text-base text-Neutrals-01">
                New Arrivals
              </span>
            </div>
            <div className="flex justify-between p-2 md:p-4 rounded-md bg-[#E2E2E2] mt-2">
              <div className="flex justify-start gap-2 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <path
                    d="M1.66699 9.99997L9.70218 14.0176C9.8115 14.0722 9.86616 14.0996 9.92349 14.1103C9.97427 14.1198 10.0264 14.1198 10.0772 14.1103C10.1345 14.0996 10.1891 14.0722 10.2985 14.0176L18.3337 9.99997M1.66699 14.1666L9.70218 18.1842C9.8115 18.2389 9.86616 18.2662 9.92349 18.277C9.97427 18.2865 10.0264 18.2865 10.0772 18.277C10.1345 18.2662 10.1891 18.2389 10.2985 18.1842L18.3337 14.1666M1.66699 5.83331L9.70218 1.81571C9.8115 1.76105 9.86616 1.73372 9.92349 1.72297C9.97427 1.71344 10.0264 1.71344 10.0772 1.72297C10.1345 1.73372 10.1891 1.76105 10.2985 1.81571L18.3337 5.83331L10.2985 9.8509C10.1891 9.90556 10.1345 9.93289 10.0772 9.94365C10.0264 9.95317 9.97427 9.95317 9.92349 9.94365C9.86616 9.93289 9.8115 9.90556 9.70218 9.8509L1.66699 5.83331Z"
                    stroke="#008060"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-Neutrals-01 font-semibold text-base">
                  3
                </span>
              </div>
              <div className="flex items-center">
                <animated.div
                  id="toggleButton"
                  className="h-5 w-9 p-[2px] rounded-xl relative transition-colors"
                  style={productStatusBackgroundSprings}>
                  <animated.span
                    id="toggleIndicator"
                    className="w-4 h-4 bg-white rounded-full absolute top-0.5 filter-toggle transition-transform"
                    style={productsStatusPositionSprings}></animated.span>
                </animated.div>
              </div>
            </div>
          </animated.div>
          <animated.div style={articlesSettingSprings}>
            <div className="flex justify-start items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none">
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="#101828"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-medium text-sm md:text-base text-Neutrals-01">
                Latest Articles
              </span>
            </div>
            <div className="flex justify-between p-2 md:p-4  rounded-md bg-[#E2E2E2] mt-2">
              <div className="flex justify-start gap-2 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <path
                    d="M1.66699 9.99997L9.70218 14.0176C9.8115 14.0722 9.86616 14.0996 9.92349 14.1103C9.97427 14.1198 10.0264 14.1198 10.0772 14.1103C10.1345 14.0996 10.1891 14.0722 10.2985 14.0176L18.3337 9.99997M1.66699 14.1666L9.70218 18.1842C9.8115 18.2389 9.86616 18.2662 9.92349 18.277C9.97427 18.2865 10.0264 18.2865 10.0772 18.277C10.1345 18.2662 10.1891 18.2389 10.2985 18.1842L18.3337 14.1666M1.66699 5.83331L9.70218 1.81571C9.8115 1.76105 9.86616 1.73372 9.92349 1.72297C9.97427 1.71344 10.0264 1.71344 10.0772 1.72297C10.1345 1.73372 10.1891 1.76105 10.2985 1.81571L18.3337 5.83331L10.2985 9.8509C10.1891 9.90556 10.1345 9.93289 10.0772 9.94365C10.0264 9.95317 9.97427 9.95317 9.92349 9.94365C9.86616 9.93289 9.8115 9.90556 9.70218 9.8509L1.66699 5.83331Z"
                    stroke="#008060"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-Neutrals-01 font-semibold text-base">
                  4
                </span>
              </div>
              <div className="flex items-center">
                <animated.div
                  id="toggleButton"
                  className="h-5 w-9 p-[2px] rounded-xl relative transition-colors"
                  style={articlesStatusBackgroundSprings}>
                  <animated.span
                    id="toggleIndicator"
                    className="w-4 h-4 bg-white rounded-full absolute top-0.5 filter-toggle transition-transform"
                    style={articlesStatusPositionSprings}></animated.span>
                </animated.div>
              </div>
            </div>
          </animated.div>
        </div>
      </animated.div>
      <div className="setting__shadow"></div>
    </div>
  );
};

export default BuilderSVG;

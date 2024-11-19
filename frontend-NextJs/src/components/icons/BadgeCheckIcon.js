const BadgeCheckIcon = ({ size = 24, color = "green", checkColor = "white", ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-${size} h-${size} ${props.className || ''}`}
      {...props}
    >
      <circle cx="12" cy="12" r="10" fill={color} />
      <path d="M9 12l2 2 4-4" stroke={checkColor} strokeWidth="2" fill="none" />
    </svg>
  );
  
  export default BadgeCheckIcon;
  
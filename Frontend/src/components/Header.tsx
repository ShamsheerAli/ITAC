
import { Images } from "../assets/images";

const Header = () => {
  return (
    <header className="w-full bg-white ">
      <div className="w-full max-w-[1330px] mx-auto overflow-hidden">
        <div className="relative flex items-center h-10 md:h-20 lg:h-30 pr-36 -mb-3 ">
          {/* CENTER IMAGE — BACKGROUND */}
          <img
            src={Images.peteBackground}
            alt="Center Background Logo"
            className="
            absolute
            left-1/2
            -translate-x-1/2
            h-10 md:h-20 lg:h-30
            w-[120vw]
            scale-110
            object-contain
            opacity-15
            z-0
            pointer-events-none
          "
          />

          {/* LEFT IMAGE */}
          <img
            src={Images.osuItacLogo}
            alt="OSU"
            className="h-10 md:h-20 lg:h-30 w-auto object-contain relative z-10"
          />

          {/* RIGHT IMAGE */}
          <img
            src={Images.itacLogo}
            alt="ITAC"
            className="h-10 md:h-20 lg:h-30 w-auto object-contain ml-auto relative z-10"
          />
        </div>
      </div>

      {/* ORANGE DIVIDER */}
      <div className="h-[0.65vh] bg-[#FE5C00] w-full" />
      <hr className="border-t-30 border-black-300 w-full" />
    </header>
  );
};

export default Header;

export default function Navbar() {
  return (
    <div className="fixed w-full top-0 lg:pl-6 lg:pr-6 pl-5 pr-4 px-5 z-70 h-[64px]">
      <div className="group flex h-full border-b border-white items-center justify-center  mx-auto relative z-10 border-opacity-0">
        <div className="items-center hidden lg:flex min-w-0 opacity-100 pointer-events-auto duration-200  false">
          <div className="flex min-w-0 mt-2">
            <div className="flex flex-col">
              <div className="uppercase w-[fit-content] flex text-xs font-medium flex-row items-center gap-1 py-2 px-3 rounded-full mb-2 select-none duration-[50ms] cursor-pointer text-white hover:bg-white/75 hover:text-black hover:shadow-md">
                <a href="/about">About</a>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="uppercase w-[fit-content] flex text-xs font-medium flex-row items-center gap-1 py-2 px-3 rounded-full mb-2 select-none duration-[50ms] cursor-pointer text-white hover:bg-white/75 hover:text-black hover:shadow-md">
                <a href="/membership">Membership</a>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="uppercase w-[fit-content] flex text-xs font-medium flex-row items-center gap-1 py-2 px-3 rounded-full mb-2 select-none duration-[50ms] cursor-pointer text-white hover:bg-white/75 hover:text-black hover:shadow-md">
                <a href="/gallery">Gallery</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

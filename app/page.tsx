import PixelGlass from "@/app/anim/components/PixelGlass";
import Morph from "@/app/anim/assets/Morph"

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center font-sans">
      <PixelGlass
        blueOffset={16}
        borderRadius={52}
        brightness={48}
        disablePixels={false}
        displace={2.5}
        distortionScale={-100}
        greenOffset={24}
        mixBlendMode="screen"
        opacity={0.56}
        pixel={{ variant: "green" }}
        redOffset={32}
        width={"80%"}
        height={"80%"}
        className="flex flex-1 flex-col items-center justify-between p-20 m-20 sm:items-start"
      >
        <main>
          <Morph />
        </main>
      </PixelGlass>
    </div>
  );
}

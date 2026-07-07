import { Suspense } from "react";
import {
  SiReact,
  SiNextdotjs,
  SiNestjs,
  SiFlask,
  SiKotlin,
  SiTypescript,
  SiZod,
  SiReactquery,
  SiNodedotjs,
  SiNginx,
  SiNetlify,
  SiVercel,
  SiNpm,
  SiWebpack,
  SiVite,
  SiUbuntu,
  SiLinux,
  SiDocker,
  SiSwagger,
  SiTailwindcss,
  SiShadcnui,
  SiMui,
  SiSass,
  SiRedis,
  SiPostgresql,
  SiMysql,
  SiMongodb,
  SiMongoose,
  SiPrisma,
  SiGit,
  SiGithubactions,
  SiModelcontextprotocol,
  SiMermaid,
  SiInsomnia,
  SiJest,
  SiPostman,
} from "react-icons/si";
import PixelGlass from "@/app/anim/components/PixelGlass";
// import Morph from "@/app/anim/assets/Morph"
import ReflectiveCard from "@/components/ReflectiveCard";
import GlareHover from "@/components/GlareHover";
import LogoLoop from "@/components/LogoLoop";
import TopLanguages, { TopLanguagesSkeleton } from "@/components/TopLanguages";
import user from "@/app/data/user.json";

const techLogos = [
  // Frameworks
  {
    node: <SiReact aria-label="React" color="#FFFFFF66" />,
    title: "React",
    href: "https://react.dev",
  },
  {
    node: <SiNextdotjs aria-label="Next.js" color="#FFFFFF66" />,
    title: "Next.js",
    href: "https://nextjs.org",
  },
  {
    node: <SiNestjs aria-label="NestJS" color="#FFFFFF66" />,
    title: "NestJS",
    href: "https://nestjs.com",
  },
  {
    node: <SiFlask aria-label="Flask" color="#FFFFFF66" />,
    title: "Flask",
    href: "https://flask.palletsprojects.com",
  },
  {
    node: <SiKotlin aria-label="Kotlin" color="#FFFFFF66" />,
    title: "Kotlin",
    href: "https://kotlinlang.org/docs/getting-started.html",
  },

  // Types & validation
  {
    node: <SiTypescript aria-label="TypeScript" color="#FFFFFF66" />,
    title: "TypeScript",
    href: "https://www.typescriptlang.org",
  },
  { node: <SiZod aria-label="Zod" color="#FFFFFF66" />, title: "Zod", href: "https://zod.dev" },

  // Data fetching & state
  {
    node: <SiReactquery aria-label="TanStack Query" color="#FFFFFF66" />,
    title: "TanStack Query",
    href: "https://tanstack.com/query/latest",
  },

  // Runtime
  {
    node: <SiNodedotjs aria-label="Node.js" color="#FFFFFF66" />,
    title: "Node.js",
    href: "https://nodejs.org",
  },

  // Build tools & package managers
  {
    node: <SiWebpack aria-label="Webpack" color="#FFFFFF66" />,
    title: "Webpack",
    href: "https://webpack.js.org",
  },
  { node: <SiVite aria-label="Vite" color="#FFFFFF66" />, title: "Vite", href: "https://vite.dev" },
  {
    node: <SiNpm aria-label="npm" color="#FFFFFF66" />,
    title: "npm",
    href: "https://www.npmjs.com",
  },

  // Styling & UI
  {
    node: <SiTailwindcss aria-label="Tailwind CSS" color="#FFFFFF66" />,
    title: "Tailwind CSS",
    href: "https://tailwindcss.com",
  },
  {
    node: <SiShadcnui aria-label="shadcn/ui" color="#FFFFFF66" />,
    title: "shadcn/ui",
    href: "https://ui.shadcn.com",
  },
  { node: <SiMui aria-label="MUI" color="#FFFFFF66" />, title: "MUI", href: "https://mui.com" },
  {
    node: <SiSass aria-label="Sass" color="#FFFFFF66" />,
    title: "Sass",
    href: "https://sass-lang.com",
  },

  // Databases & ORM
  {
    node: <SiPostgresql aria-label="PostgreSQL" color="#FFFFFF66" />,
    title: "PostgreSQL",
    href: "https://www.postgresql.org",
  },
  {
    node: <SiMysql aria-label="MySQL" color="#FFFFFF66" />,
    title: "MySQL",
    href: "https://www.mysql.com",
  },
  {
    node: <SiMongodb aria-label="MongoDB" color="#FFFFFF66" />,
    title: "MongoDB",
    href: "https://www.mongodb.com",
  },
  {
    node: <SiMongoose aria-label="Mongoose" color="#FFFFFF66" />,
    title: "Mongoose",
    href: "https://mongoosejs.com",
  },
  // {
  //   node: <SiPrisma aria-label="Prisma" color="#FFFFFF66" />,
  //   title: "Prisma",
  //   href: "https://www.prisma.io",
  // },
  {
    node: <SiRedis aria-label="Redis" color="#FFFFFF66" />,
    title: "Redis",
    href: "https://redis.io",
  },

  // API tooling
  {
    node: <SiSwagger aria-label="Swagger" color="#FFFFFF66" />,
    title: "Swagger",
    href: "https://swagger.io",
  },
  {
    node: <SiPostman aria-label="Postman" color="#FFFFFF66" />,
    title: "Postman",
    href: "https://www.postman.com/",
  },

  // Server, OS & hosting
  {
    node: <SiNginx aria-label="Nginx" color="#FFFFFF66" />,
    title: "Nginx",
    href: "https://nginx.org",
  },
  // {
  //   node: <SiNetlify aria-label="Netlify" color="#FFFFFF66" />,
  //   title: "Netlify",
  //   href: "https://www.netlify.com",
  // },
  {
    node: <SiVercel aria-label="Vercel" color="#FFFFFF66" />,
    title: "Vercel",
    href: "https://vercel.com",
  },
  {
    node: <SiUbuntu aria-label="Ubuntu" color="#FFFFFF66" />,
    title: "Ubuntu",
    href: "https://ubuntu.com",
  },
  {
    node: <SiLinux aria-label="Linux" color="#FFFFFF66" />,
    title: "Linux",
    href: "https://www.kernel.org",
  },
  {
    node: <SiDocker aria-label="Docker" color="#FFFFFF66" />,
    title: "Docker",
    href: "https://www.docker.com",
  },

  // CI & version control
  { node: <SiGit aria-label="Git" color="#FFFFFF66" />, title: "Git", href: "https://git-scm.com" },
  {
    node: <SiGithubactions aria-label="GitHub Actions" color="#FFFFFF66" />,
    title: "GitHub Actions",
    href: "https://github.com/features/actions",
  },

  // Utilities & tooling
  {
    node: <SiMermaid aria-label="Mermaid" color="#FFFFFF66" />,
    title: "Mermaid",
    href: "https://mermaid.js.org",
  },
  {
    node: <SiModelcontextprotocol aria-label="Model Context Protocol" color="#FFFFFF66" />,
    title: "Model Context Protocol",
    href: "https://modelcontextprotocol.io",
  },

  // Tests
  {
    node: <SiJest aria-label="Jest" color="#FFFFFF66" />,
    title: "Jest",
    href: "https://jestjs.io/",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center font-sans">
      <PixelGlass
        blueOffset={0}
        redOffset={0}
        greenOffset={0}
        borderRadius={16}
        borderWidth={0.06}
        brightness={50}
        disablePixels={true}
        displace={1}
        distortionScale={10}
        mixBlendMode="screen"
        opacity={0.93}
        pixel={{ variant: "green" }}
        width={"100%"}
        height={"100%"}
        className="flex flex-1 flex-col items-center justify-between p-21 sm:items-start"
      >
        {/* <Morph /> */}
        <div id="main-board" className="m-8 h-auto w-full p-8">
          <div className="flex flex-row gap-4">
            <GlareHover
              width="320px"
              height="500px"
              background="transparent"
              borderColor="transparent"
              borderRadius="20px"
              glareColor="#faf1e2"
              glareOpacity={0.35}
              glareAngle={-45}
              glareSize={0.4}
              transitionDuration={650}
            >
              <ReflectiveCard
                name={`${user.name.first_name}\u00A0${user.name.last_name}`}
                education={user.education.specialisation}
                metalness={1}
                roughness={0.85}
                specularConstant={0.7}
                noiseScale={1.6}
                blurStrength={14}
              />
            </GlareHover>
            <Suspense fallback={<TopLanguagesSkeleton />}>
              <TopLanguages className="self-end" />
            </Suspense>
          </div>
          <LogoLoop logos={techLogos} />
        </div>
      </PixelGlass>
    </main>
  );
}

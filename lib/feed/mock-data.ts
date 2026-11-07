import type {
  FeedNotificationData,
  FeedPostData,
  FeedUserData,
  RecommendedUserData,
} from "@/lib/feed/types"

export const currentFeedUser: FeedUserData = {
  name: "Rafael Lima",
  avatar: "/avatars/rafael-lima-demo.png",
}

export const feedPosts: FeedPostData[] = [
  {
    id: "analytics-studio",
    author: {
      name: "Bruno Rocha",
      avatar: "/feed/avatars/bruno-rocha.png",
    },
    content:
      "Explorei uma nova forma de reunir métricas de projetos criativos sem deixar a interface com cara de painel corporativo.",
    technologies: ["web", "typescript", "database"],
    media: {
      src: "/feed/posts/analytics-studio.png",
      alt: "Mockup fictício de uma interface de analytics para um estúdio criativo",
    },
    score: 128,
  },
  {
    id: "wellness-mobile",
    author: {
      name: "Larissa Nunes",
      avatar: "/feed/avatars/larissa-nunes.png",
    },
    content:
      "Esse conceito nasceu de um estudo sobre rotinas mais leves. Trabalhei uma navegação simples, cores acolhedoras e pequenas pausas visuais para tornar o acompanhamento diário mais agradável.",
    technologies: ["mobile", "react", "design"],
    media: {
      src: "/feed/posts/wellness-mobile.png",
      alt: "Mockup fictício de um aplicativo mobile de bem-estar",
    },
    score: 204,
  },
  {
    id: "commerce-system",
    author: {
      name: "Marina Alves",
      avatar: "/feed/avatars/marina-alves.png",
    },
    content:
      "Organizei os principais componentes de uma experiência de compra para testar consistência entre catálogo, produto e checkout.",
    technologies: ["interface-design", "react", "cloud"],
    media: {
      src: "/feed/posts/commerce-system.png",
      alt: "Mockup fictício de um design system para comércio eletrônico",
    },
    score: 91,
  },
]

export const recommendedUsers: RecommendedUserData[] = [
  {
    name: "Ana Costa",
    technologies: ["react", "typescript", "design"],
  },
  {
    name: "Lucas Mendes",
    technologies: ["web", "database", "cloud"],
  },
  {
    name: "Camila Rocha",
    technologies: ["interface-design", "mobile", "react"],
  },
  {
    name: "Diego Alves",
    technologies: ["typescript", "web", "database"],
  },
]

export const feedNotifications: FeedNotificationData[] = [
  {
    id: "ana-comment",
    title: "Ana Costa comentou no seu post",
    time: "Há 5 min",
    unread: true,
  },
  {
    id: "lucas-like",
    title: "Lucas Mendes curtiu o seu post",
    time: "Há 18 min",
    unread: true,
  },
  {
    id: "camila-comment",
    title: "Camila Rocha comentou no seu post",
    time: "Há 1 h",
    unread: false,
  },
  {
    id: "diego-like",
    title: "Diego Alves curtiu o seu post",
    time: "Ontem às 19:42",
    unread: false,
  },
]

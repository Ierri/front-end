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

// Relações fictícias do perfil demonstrativo enquanto não há integração.
export const followedDemoAuthors = [
  "/feed/avatars/bruno-rocha.png",
  "/feed/avatars/marina-alves.png",
]

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
    media: [
      {
        id: "analytics-overview",
        type: "image",
        src: "/feed/posts/analytics-studio.png",
        alt: "Visão geral fictícia do Analytics Studio com gráficos e indicadores",
      },
      {
        id: "analytics-audience",
        type: "image",
        src: "/feed/posts/analytics-studio-audience.png",
        alt: "Tela fictícia do Analytics Studio com métricas de público e campanhas",
      },
      {
        id: "analytics-reporting",
        type: "image",
        src: "/feed/posts/analytics-studio-reporting.png",
        alt: "Tela fictícia de relatórios do Analytics Studio com gráficos e distribuição geográfica",
      },
    ],
    score: 128,
    comments: [
      {
        id: "larissa-feedback",
        author: {
          name: "Larissa Nunes",
          avatar: "/feed/avatars/larissa-nunes.png",
        },
        technologies: ["mobile", "react", "design"],
        content:
          "A hierarquia ficou muito boa. Mesmo com bastante informação, o olhar encontra rápido os indicadores principais.",
        time: "Há 12 min",
        replies: [
          {
            id: "bruno-reply",
            author: {
              name: "Bruno Rocha",
              avatar: "/feed/avatars/bruno-rocha.png",
            },
            technologies: ["web", "typescript", "database"],
            content:
              "Obrigado! Essa era a principal intenção ao reduzir o peso visual dos elementos secundários.",
            time: "Há 6 min",
            replies: [
              {
                id: "marina-thread-reply",
                author: {
                  name: "Marina Alves",
                  avatar: "/feed/avatars/marina-alves.png",
                },
                technologies: ["interface-design", "react", "cloud"],
                content:
                  "Funcionou bem, principalmente na tela de relatórios. O coral conduz sem dominar.",
                time: "Há 2 min",
                replies: [],
              },
            ],
          },
        ],
      },
      {
        id: "marina-feedback",
        author: {
          name: "Marina Alves",
          avatar: "/feed/avatars/marina-alves.png",
        },
        technologies: ["interface-design", "react", "cloud"],
        content:
          "Gostei da consistência entre as três telas. A navegação lateral dá uma identidade bem clara ao produto.",
        time: "Há 28 min",
        replies: [],
      },
    ],
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
    media: [
      {
        id: "wellness-overview",
        type: "image",
        src: "/feed/posts/wellness-mobile.png",
        alt: "Mockup fictício de um aplicativo mobile de bem-estar",
      },
    ],
    score: 204,
    comments: [
      {
        id: "bruno-wellness-feedback",
        author: {
          name: "Bruno Rocha",
          avatar: "/feed/avatars/bruno-rocha.png",
        },
        technologies: ["web", "typescript", "database"],
        content:
          "O ritmo dos espaços deixa a experiência realmente tranquila. Curti especialmente o contraste suave dos cards.",
        time: "Há 34 min",
        replies: [],
      },
      {
        id: "marina-wellness-feedback",
        author: {
          name: "Marina Alves",
          avatar: "/feed/avatars/marina-alves.png",
        },
        technologies: ["interface-design", "react", "cloud"],
        content:
          "A composição parece simples, mas tem muitos detalhes cuidadosos. Ficou acolhedora sem perder clareza.",
        time: "Há 1 h",
        replies: [],
      },
    ],
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
    media: [
      {
        id: "commerce-overview",
        type: "image",
        src: "/feed/posts/commerce-system.png",
        alt: "Mockup fictício de um design system para comércio eletrônico",
      },
    ],
    score: 91,
    comments: [
      {
        id: "larissa-commerce-feedback",
        author: {
          name: "Larissa Nunes",
          avatar: "/feed/avatars/larissa-nunes.png",
        },
        technologies: ["mobile", "react", "design"],
        content:
          "A consistência dos componentes está ótima. Dá para imaginar o sistema crescendo sem perder o padrão.",
        time: "Há 46 min",
        replies: [],
      },
    ],
  },
]

const profileDemoPostTitles: Record<string, string> = {
  "analytics-studio": "Analytics Studio",
  "wellness-mobile": "Wellness Mobile",
  "commerce-system": "Commerce System",
}

export const profilePosts: FeedPostData[] = feedPosts.slice(0, 3).map((post) => ({
  ...post,
  id: `rafael-${post.id}`,
  author: currentFeedUser,
  content: post.content,
}))

export function getFeedPostById(postId: string) {
  return (
    feedPosts.find((post) => post.id === postId) ??
    profilePosts.find((post) => post.id === postId)
  )
}

export function getProfilePostTitle(postId: string) {
  return profileDemoPostTitles[postId.replace(/^rafael-/, "")] ?? "Projeto"
}

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

const SITE = {
  name: "Robson Martins",
  brand: "Robson Imóveis",
  tagline: "Especialista no Cury Porto Maravilha",
  city: "Rio de Janeiro",
  whatsappNumber: "5521966778530",
  whatsappDisplay: "(21) 96677-8530",
  instagramHandle: "@robsonimoveis",
  instagramUrl: "#",
  photo: "images/robson.png",
  regioes: [
    "Porto Maravilha",
    "Centro do Rio",
    "São Cristóvão",
    "Niterói",
    "Barra da Tijuca",
    "Irajá",
    "Piedade",
    "Ramos",
  ],
};

const MESSAGES = {
  hero: "Olá! Gostaria de falar com o Robson Martins sobre o Cury Porto Maravilha, no Centro do Rio.",
  interest: (titulo) =>
    `Olá, tenho interesse na planta ${titulo} do Cury Porto Maravilha.`,
  lead: ({ nome, telefone, email, empreendimento, renda, mensagem }) => {
    const lines = [
      `Olá, sou ${nome}.`,
      empreendimento
        ? `Tenho interesse na planta ${empreendimento} do Cury Porto Maravilha.`
        : "Tenho interesse no Cury Porto Maravilha, no Centro do Rio.",
      renda ? `Renda familiar: ${renda}.` : "",
      telefone ? `Meu WhatsApp: ${telefone}.` : "",
      email ? `E-mail: ${email}.` : "",
      mensagem ? `Mensagem: ${mensagem}` : "",
    ];
    return lines.filter(Boolean).join(" ");
  },
};

function whatsappUrl(text) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export interface ProductBrand {
  id: string;
  brandName: string;
  weight: string;
  price: number;
  market: string;
  image: string;
  rating: number;
  popularity: string;
  description: string;
}

export interface CategoryProduct {
  id: string;
  name: string;
  color: string;
  brands: ProductBrand[];
}

export const PRODUCT_CATALOG: Record<string, CategoryProduct[]> = {
  padaria: [
    {
      id: 'p1',
      name: 'Pão Francês',
      color: '#f5deb3',
      brands: [
        { id: 'p1-b1', brandName: 'Padaria Central', weight: '50g (un)', price: 0.50, market: 'Padaria Central', image: 'https://picsum.photos/seed/bread1/200/200', rating: 4.8, popularity: 'Alta', description: 'Pão quentinho saindo a cada 30 min.' },
        { id: 'p1-b2', brandName: 'Artesanal Premium', weight: '60g (un)', price: 0.85, market: 'Padaria Central', image: 'https://picsum.photos/seed/bread2/200/200', rating: 4.9, popularity: 'Média', description: 'Fermentação natural, crosta crocante.' }
      ]
    },
    {
      id: 'p2',
      name: 'Bolo de Chocolate',
      color: '#3e2723',
      brands: [
        { id: 'p2-b1', brandName: 'Dona Benta', weight: '500g', price: 18.00, market: 'Mini Mercado Silva', image: 'https://picsum.photos/seed/cake1/200/200', rating: 4.5, popularity: 'Alta', description: 'Bolo fofinho com cobertura de brigadeiro.' },
        { id: 'p2-b2', brandName: 'Casa de Bolos', weight: '700g', price: 25.00, market: 'Padaria Central', image: 'https://picsum.photos/seed/cake2/200/200', rating: 4.7, popularity: 'Alta', description: 'Receita caseira tradicional.' }
      ]
    }
  ],
  bebidas: [
    {
      id: 'b1',
      name: 'Água Mineral',
      color: '#add8e6',
      brands: [
        { id: 'b1-b1', brandName: 'Minalba', weight: '500ml', price: 1.80, market: 'Mini Mercado Silva', image: 'https://picsum.photos/seed/water1/200/200', rating: 4.6, popularity: 'Alta', description: 'Água mineral natural sem gás.' },
        { id: 'b1-b2', brandName: 'Bonafont', weight: '500ml', price: 2.20, market: 'Mini Mercado Silva', image: 'https://picsum.photos/seed/water2/200/200', rating: 4.7, popularity: 'Alta', description: 'Água leve e equilibrada.' },
        { id: 'b1-b3', brandName: 'Crystal', weight: '1.5L', price: 4.50, market: 'Mini Mercado Silva', image: 'https://picsum.photos/seed/water3/200/200', rating: 4.5, popularity: 'Média', description: 'Embalagem econômica.' }
      ]
    },
    {
      id: 'b2',
      name: 'Refrigerante Cola',
      color: '#b71c1c',
      brands: [
        { id: 'b2-b1', brandName: 'Coca-Cola', weight: '350ml', price: 4.50, market: 'Mini Mercado Silva', image: 'https://picsum.photos/seed/soda1/200/200', rating: 4.9, popularity: 'Máxima', description: 'O sabor original.' },
        { id: 'b2-b2', brandName: 'Pepsi', weight: '350ml', price: 3.80, market: 'Mini Mercado Silva', image: 'https://picsum.photos/seed/soda2/200/200', rating: 4.4, popularity: 'Alta', description: 'Pode ser Pepsi?' }
      ]
    }
  ],
  hortifruti: [
    {
      id: 'h1',
      name: 'Maçã Fuji',
      color: '#d32f2f',
      brands: [
        { id: 'h1-b1', brandName: 'Horti Vila', weight: '1kg', price: 8.50, market: 'Hortifruti da Vila', image: 'https://picsum.photos/seed/apple1/200/200', rating: 4.8, popularity: 'Alta', description: 'Maçãs selecionadas e doces.' },
        { id: 'h1-b2', brandName: 'Orgânico Real', weight: '500g', price: 12.00, market: 'Hortifruti da Vila', image: 'https://picsum.photos/seed/apple2/200/200', rating: 4.9, popularity: 'Média', description: 'Livre de agrotóxicos.' }
      ]
    }
  ],
  mercearia: [
    {
      id: 'm1',
      name: 'Arroz',
      color: '#fafafa',
      brands: [
        { id: 'm1-b1', brandName: 'Tio João', weight: '5kg', price: 28.50, market: 'Mini Mercado Silva', image: 'https://picsum.photos/seed/rice1/200/200', rating: 4.8, popularity: 'Alta', description: 'Arroz tipo 1, agulhinha.' },
        { id: 'm1-b2', brandName: 'Prato Fino', weight: '5kg', price: 32.00, market: 'Mini Mercado Silva', image: 'https://picsum.photos/seed/rice2/200/200', rating: 4.9, popularity: 'Alta', description: 'O melhor arroz do Brasil.' },
        { id: 'm1-b3', brandName: 'Camil', weight: '1kg', price: 6.50, market: 'Mini Mercado Silva', image: 'https://picsum.photos/seed/rice3/200/200', rating: 4.7, popularity: 'Média', description: 'Praticidade para o dia a dia.' }
      ]
    },
    {
      id: 'm2',
      name: 'Café',
      color: '#3e2723',
      brands: [
        { id: 'm2-b1', brandName: 'Pilão', weight: '500g', price: 18.50, market: 'Mini Mercado Silva', image: 'https://picsum.photos/seed/coffee1/200/200', rating: 4.7, popularity: 'Alta', description: 'O café forte do Brasil.' },
        { id: 'm2-b2', brandName: 'Melitta', weight: '500g', price: 19.80, market: 'Mini Mercado Silva', image: 'https://picsum.photos/seed/coffee2/200/200', rating: 4.8, popularity: 'Alta', description: 'Sabor e aroma intensos.' },
        { id: 'm2-b3', brandName: 'L\'OR Espresso', weight: '250g', price: 24.00, market: 'Mini Mercado Silva', image: 'https://picsum.photos/seed/coffee3/200/200', rating: 4.9, popularity: 'Média', description: 'Café gourmet superior.' }
      ]
    }
  ],
  limpeza: [
    {
      id: 'l1',
      name: 'Detergente',
      color: '#039be5',
      brands: [
        { id: 'l1-b1', brandName: 'Ypê', weight: '500ml', price: 2.40, market: 'Mini Mercado Silva', image: 'https://picsum.photos/seed/det1/200/200', rating: 4.9, popularity: 'Alta', description: 'Rende mais, limpa melhor.' },
        { id: 'l1-b2', brandName: 'Limpol', weight: '500ml', price: 2.10, market: 'Mini Mercado Silva', image: 'https://picsum.photos/seed/det2/200/200', rating: 4.6, popularity: 'Média', description: 'Eficiente contra gordura.' }
      ]
    }
  ]
};

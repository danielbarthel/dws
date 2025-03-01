export interface ArtikelDocument {
  id: string;
  Angebot: boolean;
  Artikelname: string;
  Bildpfad: string;
  Food: boolean;
  Markt: string;
  Preis: number;
  Produkt: string;
  Topangebot: boolean;
  Zusatzinfos: string[];
  timestamp: Date;
}

export interface EinkaufszettelDocument {
  name: string;
  produktid: string[];
  uid: string;
}

export interface RezepteDocument {
  difficulty: string;
  id: string;
  image_path: string;
  image_urls: string[];
  ingredients: {
    amount: string;
    name: string;
    unit: string;
  }[];
  nutrition: {
    kcal: number;
    portions: number;
  };
  rating: {
    ratingCount: number;
    ratingValue: number;
  };
  source: string;
  source_url: string;
  steps: string[];
  title: string;
  totalTime: number;
}

export interface RezeptzettelDocument {
  name: string;
  produktid: string[];
  uid: string;
}

export interface UserDocument {
  einkaufszettelID: string;
  likedRecipes: string[];
  name: string;
  profileImageUrl: string;
  rezeptzettelID: string;
  uid: string;
}

'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { getStoredItems, saveStoredItems, runFirestoreTaskSafe } from './firestore-sync';

export interface RentalCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  description?: string;
  itemCount?: number;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RentalFitScore {
  small: number;
  accurate: number;
  large: number;
}

export interface RentalItem {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  pricePerDay: number;
  originalPrice?: number;
  currency?: string;
  badge?: string;
  rating?: number;
  reviewsCount?: number;
  imageUrl: string;
  gallery: string[];
  sizes: string[];
  fitScore?: RentalFitScore;
  clientPhotos?: string[];
  description: string;
  details?: string;
  available: boolean;
  stockQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error(`[Firestore ${operationType.toUpperCase()} Error at ${path}]:`, error);
  return errInfo;
}

export const INITIAL_RENTAL_CATEGORIES: RentalCategory[] = [
  {
    id: 'cat-bureau',
    name: 'Tenues de bureau',
    slug: 'tenues-de-bureau',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    description: 'Costumes modernes, tailleurs fluides et chemises structurées pour une élégance professionnelle affirmée.',
    order: 1,
    itemCount: 8,
  },
  {
    id: 'cat-boheme',
    name: 'Romance bohème',
    slug: 'romance-boheme',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
    description: 'Coupes fluides, broderies fines et mailles réconfortantes à l’esprit libre et poétique.',
    order: 2,
    itemCount: 6,
  },
  {
    id: 'cat-weekend',
    name: 'Week-end off',
    slug: 'week-end-off',
    imageUrl: 'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&q=80&w=600',
    description: 'Vestes confortables, sweat-shirts premium et pièces décontractées pour vos escapades.',
    order: 3,
    itemCount: 7,
  },
  {
    id: 'cat-petites',
    name: 'Spécial Petites',
    slug: 'special-petites',
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=600',
    description: 'Proportions impeccablement étudiées pour les silhouettes menues (moins de 1m63).',
    order: 4,
    itemCount: 5,
  },
  {
    id: 'cat-denim',
    name: 'Denim',
    slug: 'denim',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600',
    description: 'Jeans iconiques, combinaisons et vestes en toile denim brute ou délavée haute qualité.',
    order: 5,
    itemCount: 6,
  },
  {
    id: 'cat-soir',
    name: 'Le soir & Gala',
    slug: 'le-soir-et-gala',
    imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600',
    description: 'Robes de cocktail spectaculaires, fentes sensuelles et tissus soyeux pour briller en soirée.',
    order: 6,
    itemCount: 7,
  },
  {
    id: 'cat-populaires',
    name: 'Les plus populaires',
    slug: 'les-plus-populaires',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600',
    description: 'Les pièces coup de cœur les plus réservées et portées par notre communauté.',
    order: 7,
    itemCount: 9,
  },
  {
    id: 'cat-maternite',
    name: 'Espace maternité',
    slug: 'espace-maternite',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=600',
    description: 'Robes drapées extensibles et coupes étudiées pour sublimer les futures mamans sans compromis.',
    order: 8,
    itemCount: 4,
  },
  {
    id: 'cat-costumes',
    name: 'Costumes & Smokings',
    slug: 'costumes-et-smokings',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600',
    description: 'Vestons d’apparat, smokings en velours et costumes trois pièces de haute facture.',
    order: 9,
    itemCount: 5,
  },
  {
    id: 'cat-hightech',
    name: 'High-Tech & Sonorisation',
    slug: 'high-tech-et-sonorisation',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600',
    description: 'Microphones HF sans fil, régies DJ, enceintes amplifiées et matériel audiovisuel pour vos événements.',
    order: 10,
    itemCount: 4,
  },
  {
    id: 'cat-accessoires',
    name: 'Accessoires & Sacs',
    slug: 'accessoires-et-sacs',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600',
    description: 'Minaudières, sacs haute maroquinerie, bijoux d’apparat et étoles de luxe.',
    order: 11,
    itemCount: 6,
  },
];

export const INITIAL_RENTAL_ITEMS: RentalItem[] = [
  {
    id: 'item-dianne',
    name: 'Chemise Dianne',
    brand: 'Musy Muse',
    categoryId: 'cat-bureau',
    categoryName: 'Tenues de bureau',
    pricePerDay: 69,
    originalPrice: 280,
    currency: '$',
    badge: 'Populaire',
    rating: 4.9,
    reviewsCount: 72,
    sizes: ['S/M', 'M/L', 'L/XL'],
    fitScore: { small: 7, accurate: 85, large: 8 },
    imageUrl: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&q=80&w=900',
    gallery: [
      'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=900',
    ],
    clientPhotos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
    ],
    description: 'Chemise rayée blanche et bleu ciel sublimée de broderies cœurs rouges sur le col et l’épaule avec inscription stylisée. Coupe subtilement oversize, tombé décontracté et chic.',
    details: 'Composition : 100% Coton biologique peigné. Nettoyage et pressing professionnel inclus dans la location. Idéal pour rendez-vous d’affaires ou cocktail décontracté.',
    available: true,
    stockQuantity: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-mabel',
    name: 'Haut Mabel',
    brand: 'Goa',
    categoryId: 'cat-boheme',
    categoryName: 'Romance bohème',
    pricePerDay: 49,
    originalPrice: 195,
    currency: '$',
    badge: 'Populaire',
    rating: 4.8,
    reviewsCount: 48,
    sizes: ['XS', 'S/M', 'M/L'],
    fitScore: { small: 5, accurate: 90, large: 5 },
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=900',
    gallery: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900',
    ],
    description: 'Haut en maille ajourée ivoire avec manches cloche vaporeuses et finitions côtelées soignées. Idéal superposé avec un pantalon fluide.',
    details: 'Matière douce et respirante. Lavage éco-responsable certifié.',
    available: true,
    stockQuantity: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-clementine',
    name: 'Jean Clementine',
    brand: 'Sarah John',
    categoryId: 'cat-denim',
    categoryName: 'Denim',
    pricePerDay: 55,
    originalPrice: 210,
    currency: '$',
    badge: 'Populaire',
    rating: 4.7,
    reviewsCount: 39,
    sizes: ['26', '28', '30', '32'],
    fitScore: { small: 10, accurate: 82, large: 8 },
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=900',
    gallery: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?auto=format&fit=crop&q=80&w=900',
    ],
    description: 'Jean coupe droite taille mi-haute en denim gris minéral lavé. Tombé moderne mettant en valeur toutes les paires de souliers.',
    details: '100% Coton denim premium. Teinture minérale durable.',
    available: true,
    stockQuantity: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-irisa',
    name: 'Blouse Irisa',
    brand: 'B.Young',
    categoryId: 'cat-bureau',
    categoryName: 'Tenues de bureau',
    pricePerDay: 45,
    originalPrice: 160,
    currency: '$',
    badge: 'Populaire',
    rating: 4.9,
    reviewsCount: 61,
    sizes: ['S', 'M', 'L'],
    fitScore: { small: 4, accurate: 92, large: 4 },
    imageUrl: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&q=80&w=900',
    gallery: [
      'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&q=80&w=900',
    ],
    description: 'Blouse délicate en crêpe de soie synthétique, col victorien moderne et poignets boutonnés de perles mates.',
    details: 'Infroissable, idéale pour voyages de travail et journées continues.',
    available: true,
    stockQuantity: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-tameika',
    name: 'Jean Tameika',
    brand: 'Lajoiy',
    categoryId: 'cat-denim',
    categoryName: 'Denim',
    pricePerDay: 52,
    originalPrice: 195,
    currency: '$',
    badge: 'Nouveau',
    rating: 4.6,
    reviewsCount: 23,
    sizes: ['S/M', 'M/L'],
    fitScore: { small: 8, accurate: 86, large: 6 },
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=900',
    gallery: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=900',
    ],
    description: 'Gilet sans manches en jean texturé vintage associé à des surpiqûres ocres contrastées.',
    details: 'Coupe tendance streetwear et chic.',
    available: true,
    stockQuantity: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-otilia',
    name: 'Jean Otilia',
    brand: 'Sarah John',
    categoryId: 'cat-weekend',
    categoryName: 'Week-end off',
    pricePerDay: 59,
    originalPrice: 220,
    currency: '$',
    badge: 'Populaire',
    rating: 4.8,
    reviewsCount: 34,
    sizes: ['S/M', 'M/L', 'L/XL'],
    fitScore: { small: 6, accurate: 88, large: 6 },
    imageUrl: 'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&q=80&w=900',
    gallery: [
      'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&q=80&w=900',
    ],
    description: 'Pull en grosse maille torsadée rouge carmin marié à un jean délavé ultra confortable.',
    details: 'Maille chaude et réconfortante en laine douce et mohair.',
    available: true,
    stockQuantity: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-kimberly',
    name: 'Veste Kimberly',
    brand: 'Coppereose',
    categoryId: 'cat-boheme',
    categoryName: 'Romance bohème',
    pricePerDay: 79,
    originalPrice: 310,
    currency: '$',
    badge: 'Coup de cœur',
    rating: 4.9,
    reviewsCount: 52,
    sizes: ['Unique', 'Standard'],
    fitScore: { small: 3, accurate: 94, large: 3 },
    imageUrl: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&q=80&w=900',
    gallery: [
      'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&q=80&w=900',
    ],
    description: 'Veste sans manches brodée aux motifs aztèques et bohèmes avec col châle doux.',
    details: 'Pièce forte de créateur, finitions frangées à la main.',
    available: true,
    stockQuantity: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-latrisha',
    name: 'Haut Latrisha',
    brand: 'Elenza',
    categoryId: 'cat-soir',
    categoryName: 'Le soir & Gala',
    pricePerDay: 49,
    originalPrice: 175,
    currency: '$',
    badge: 'Populaire',
    rating: 4.7,
    reviewsCount: 41,
    sizes: ['XS', 'S', 'M'],
    fitScore: { small: 9, accurate: 85, large: 6 },
    imageUrl: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&q=80&w=900',
    gallery: [
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&q=80&w=900',
    ],
    description: 'Top sculptural à col asymétrique découvrant délicatement l’épaule, confectionné en jersey stretch satiné.',
    details: 'Maintien parfait, doublure invisible.',
    available: true,
    stockQuantity: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-dovey',
    name: 'Veste Dovey',
    brand: 'Vila',
    categoryId: 'cat-weekend',
    categoryName: 'Week-end off',
    pricePerDay: 65,
    originalPrice: 240,
    currency: '$',
    badge: 'Nouveau',
    rating: 4.8,
    reviewsCount: 19,
    sizes: ['S/M', 'M/L'],
    fitScore: { small: 5, accurate: 90, large: 5 },
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=900',
    gallery: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=900',
    ],
    description: 'Veste zippée sportive bleue avec bandes rétro blanches et col montant.',
    details: 'Confort dynamique, coupe droite contemporaine.',
    available: true,
    stockQuantity: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-courdie',
    name: 'Combinaison Courdie',
    brand: 'Vila',
    categoryId: 'cat-denim',
    categoryName: 'Denim',
    pricePerDay: 85,
    originalPrice: 340,
    currency: '$',
    badge: 'Populaire',
    rating: 4.9,
    reviewsCount: 67,
    sizes: ['36', '38', '40', '42'],
    fitScore: { small: 5, accurate: 91, large: 4 },
    imageUrl: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&q=80&w=900',
    gallery: [
      'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&q=80&w=900',
    ],
    description: 'Combinaison pantalon en denim indigo foncé avec ceinture à boucle argentée et surpiqûres stylisées.',
    details: 'Allonge la silhouette, parfaite avec talons hauts ou baskets blanches.',
    available: true,
    stockQuantity: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-denyla',
    name: 'Robe Denyla',
    brand: 'LolaLiza',
    categoryId: 'cat-soir',
    categoryName: 'Le soir & Gala',
    pricePerDay: 79,
    originalPrice: 290,
    currency: '$',
    badge: 'De retour !',
    rating: 4.9,
    reviewsCount: 88,
    sizes: ['36', '38', '40'],
    fitScore: { small: 7, accurate: 87, large: 6 },
    imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=900',
    gallery: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=900',
    ],
    description: 'Robe midi bleu nuit avec décolleté croisé en V et dos nu plongeant élégant.',
    details: 'Étoffe fluide au tombé lourd qui capte la lumière.',
    available: true,
    stockQuantity: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-ayu',
    name: 'Pantalon Ayu',
    brand: 'LolaLiza',
    categoryId: 'cat-bureau',
    categoryName: 'Tenues de bureau',
    pricePerDay: 54,
    originalPrice: 195,
    currency: '$',
    badge: 'De retour !',
    rating: 4.7,
    reviewsCount: 37,
    sizes: ['S', 'M', 'L'],
    fitScore: { small: 6, accurate: 89, large: 5 },
    imageUrl: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&q=80&w=900',
    gallery: [
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&q=80&w=900',
    ],
    description: 'Pantalon carotte rose poudré avec pinces élégantes et taille haute cintrée.',
    details: 'Apporte une note de douceur sophistiquée aux tenues formelles.',
    available: true,
    stockQuantity: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-better',
    name: 'Bermuda Better',
    brand: 'Suncoo',
    categoryId: 'cat-weekend',
    categoryName: 'Week-end off',
    pricePerDay: 48,
    originalPrice: 170,
    currency: '$',
    badge: 'De retour !',
    rating: 4.6,
    reviewsCount: 29,
    sizes: ['S', 'M', 'L'],
    fitScore: { small: 5, accurate: 90, large: 5 },
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=900',
    gallery: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=900',
    ],
    description: 'Bermuda chic en lin et coton mélangés beige sable, coupe fluide arrivant au-dessus du genou.',
    details: 'Fraîcheur optimale et grande liberté de mouvement.',
    available: true,
    stockQuantity: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-costume-savile',
    name: 'Costume Trois Pièces Impérial',
    brand: 'Atelier Savile',
    categoryId: 'cat-costumes',
    categoryName: 'Costumes & Smokings',
    pricePerDay: 120,
    originalPrice: 780,
    currency: '$',
    badge: 'Coup de cœur',
    rating: 5.0,
    reviewsCount: 44,
    sizes: ['48', '50', '52', '54'],
    fitScore: { small: 4, accurate: 93, large: 3 },
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=900',
    gallery: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=900',
    ],
    description: 'Costume d’apparat complet (veste cintrée, gilet croisé et pantalon fuseau) en laine mérinos super 140s bleu nuit profond.',
    details: 'Coupe sur-mesure d’inspiration britannique, boutons en corne naturelle gravée.',
    available: true,
    stockQuantity: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-sono-pro',
    name: 'Pack Régie & Micros HF Sans Fil',
    brand: 'Sennheiser & JBL Pro',
    categoryId: 'cat-hightech',
    categoryName: 'High-Tech & Sonorisation',
    pricePerDay: 140,
    originalPrice: 1350,
    currency: '$',
    badge: 'Événement Pro',
    rating: 4.9,
    reviewsCount: 31,
    sizes: ['Kit Standard', 'Kit 4 Micros'],
    fitScore: { small: 0, accurate: 100, large: 0 },
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=900',
    gallery: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=900',
    ],
    description: 'Système complet de sonorisation pour conférences et galas : table de mixage numérique compacte, 2 microphones HF sans fil portables et câblage haute clarté.',
    details: 'Portée 100m, autonomie 12h sur batteries rechargeables fournies.',
    available: true,
    stockQuantity: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-sac-nappa',
    name: 'Sac Bandoulière Cuir Nappa',
    brand: 'Maison Florentine',
    categoryId: 'cat-accessoires',
    categoryName: 'Accessoires & Sacs',
    pricePerDay: 40,
    originalPrice: 420,
    currency: '$',
    badge: 'Luxe',
    rating: 4.9,
    reviewsCount: 56,
    sizes: ['Taille Unique'],
    fitScore: { small: 2, accurate: 96, large: 2 },
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=900',
    gallery: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=900',
    ],
    description: 'Sac à rabat confectionné en cuir d’agneau nappa noir ultra souple, chaîne dorée guillochée amovible.',
    details: 'Fermoir bijou magnétique, poche intérieure zippée avec miroir de poche.',
    available: true,
    stockQuantity: 4,
    createdAt: new Date().toISOString(),
  },
];

export const RENTAL_CATEGORIES_STORAGE_KEY = 'elimi_rental_categories_storage';
export const RENTAL_CATEGORIES_SYNC_EVENT = 'elimi_sync_rental_categories';
export const RENTAL_ITEMS_STORAGE_KEY = 'elimi_rental_items_storage';
export const RENTAL_ITEMS_SYNC_EVENT = 'elimi_sync_rental_items';

export function useRealtimeRentalCategories() {
  const [categories, setCategories] = useState<RentalCategory[]>(() =>
    getStoredItems<RentalCategory>(RENTAL_CATEGORIES_STORAGE_KEY, INITIAL_RENTAL_CATEGORIES)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    // 1. Custom sync event listener
    const handleSync = () => {
      const updated = getStoredItems<RentalCategory>(RENTAL_CATEGORIES_STORAGE_KEY, INITIAL_RENTAL_CATEGORIES);
      setCategories(updated);
    };

    window.addEventListener(RENTAL_CATEGORIES_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    // 2. Optional live subscription
    let unsubscribe: (() => void) | undefined;
    try {
      const colRef = collection(db, 'rental_categories');
      unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: RentalCategory[] = [];
            snapshot.forEach((d) => {
              list.push({ id: d.id, ...(d.data() as Omit<RentalCategory, 'id'>) });
            });
            list.sort((a, b) => (a.order || 999) - (b.order || 999));

            const currentStored = getStoredItems<RentalCategory>(RENTAL_CATEGORIES_STORAGE_KEY, INITIAL_RENTAL_CATEGORIES);
            const liveIds = new Set(list.map((c) => c.id));
            const locallyAddedOnly = currentStored.filter((c) => !liveIds.has(c.id) && c.id.startsWith('cat-'));
            const merged = [...list, ...locallyAddedOnly];

            saveStoredItems(RENTAL_CATEGORIES_STORAGE_KEY, merged);
            setCategories(merged);
            setIsLive(true);
          }
          setLoading(false);
        },
        (error) => {
          console.warn('Rental categories snapshot note (using resilient cache):', error?.message || error);
          setCategories(getStoredItems<RentalCategory>(RENTAL_CATEGORIES_STORAGE_KEY, INITIAL_RENTAL_CATEGORIES));
          setLoading(false);
        }
      );
    } catch (err) {
      console.warn('Firestore subscription fallback:', err);
    }

    return () => {
      window.removeEventListener(RENTAL_CATEGORIES_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { categories, loading, isLive };
}

export function useRealtimeRentalItems() {
  const [items, setItems] = useState<RentalItem[]>(() =>
    getStoredItems<RentalItem>(RENTAL_ITEMS_STORAGE_KEY, INITIAL_RENTAL_ITEMS)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    // 1. Custom sync event listener
    const handleSync = () => {
      const updated = getStoredItems<RentalItem>(RENTAL_ITEMS_STORAGE_KEY, INITIAL_RENTAL_ITEMS);
      setItems(updated);
    };

    window.addEventListener(RENTAL_ITEMS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    // 2. Optional live subscription
    let unsubscribe: (() => void) | undefined;
    try {
      const colRef = collection(db, 'rental_items');
      unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: RentalItem[] = [];
            snapshot.forEach((d) => {
              list.push({ id: d.id, ...(d.data() as Omit<RentalItem, 'id'>) });
            });

            const currentStored = getStoredItems<RentalItem>(RENTAL_ITEMS_STORAGE_KEY, INITIAL_RENTAL_ITEMS);
            const liveIds = new Set(list.map((i) => i.id));
            const locallyAddedOnly = currentStored.filter((i) => !liveIds.has(i.id) && i.id.startsWith('item-'));
            const merged = [...list, ...locallyAddedOnly];

            saveStoredItems(RENTAL_ITEMS_STORAGE_KEY, merged);
            setItems(merged);
            setIsLive(true);
          }
          setLoading(false);
        },
        (error) => {
          console.warn('Rental items snapshot note (using resilient cache):', error?.message || error);
          setItems(getStoredItems<RentalItem>(RENTAL_ITEMS_STORAGE_KEY, INITIAL_RENTAL_ITEMS));
          setLoading(false);
        }
      );
    } catch (err) {
      console.warn('Firestore subscription fallback:', err);
    }

    return () => {
      window.removeEventListener(RENTAL_ITEMS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { items, loading, isLive };
}

function removeUndefinedFields<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = removeUndefinedFields(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

export async function addRentalCategory(category: Omit<RentalCategory, 'id'> & { id?: string }): Promise<string> {
  const id = category.id || `cat-${Date.now()}`;
  const now = new Date().toISOString();
  const cleaned: RentalCategory = removeUndefinedFields({
    ...category,
    id,
    createdAt: now,
    updatedAt: now,
  });

  // 1. Immediately update local storage and broadcast
  const current = getStoredItems<RentalCategory>(RENTAL_CATEGORIES_STORAGE_KEY, INITIAL_RENTAL_CATEGORIES);
  const updatedList = [...current.filter((c) => c.id !== id), cleaned];
  saveStoredItems(RENTAL_CATEGORIES_STORAGE_KEY, updatedList, RENTAL_CATEGORIES_SYNC_EVENT);

  // 2. Non-blocking background sync to Firestore
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, 'rental_categories', id);
    await setDoc(docRef, cleaned);
  }, 1200, `Add rental category ${id}`);

  return id;
}

export async function updateRentalCategory(id: string, updates: Partial<RentalCategory>): Promise<void> {
  // 1. Immediately update local storage
  const current = getStoredItems<RentalCategory>(RENTAL_CATEGORIES_STORAGE_KEY, INITIAL_RENTAL_CATEGORIES);
  const fallbackCategory = INITIAL_RENTAL_CATEGORIES.find((c) => c.id === id);
  const existing = current.find((c) => c.id === id) || fallbackCategory || { id, name: '', slug: '', imageUrl: '' };
  const cleaned: RentalCategory = removeUndefinedFields({
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  });

  const updatedList = current.map((c) => (c.id === id ? cleaned : c));
  if (!updatedList.some((c) => c.id === id)) {
    updatedList.push(cleaned);
  }
  saveStoredItems(RENTAL_CATEGORIES_STORAGE_KEY, updatedList, RENTAL_CATEGORIES_SYNC_EVENT);

  // 2. Non-blocking background sync to Firestore
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, 'rental_categories', id);
    await setDoc(docRef, cleaned, { merge: true });
  }, 1200, `Update rental category ${id}`);
}

export async function deleteRentalCategory(id: string): Promise<void> {
  // 1. Immediately update local storage
  const current = getStoredItems<RentalCategory>(RENTAL_CATEGORIES_STORAGE_KEY, INITIAL_RENTAL_CATEGORIES);
  const updatedList = current.filter((c) => c.id !== id);
  saveStoredItems(RENTAL_CATEGORIES_STORAGE_KEY, updatedList, RENTAL_CATEGORIES_SYNC_EVENT);

  // 2. Non-blocking background sync to Firestore
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, 'rental_categories', id);
    await deleteDoc(docRef);
  }, 1200, `Delete rental category ${id}`);
}

export async function addRentalItem(item: Omit<RentalItem, 'id'> & { id?: string }): Promise<string> {
  const id = item.id || `item-${Date.now()}`;
  const now = new Date().toISOString();
  const cleaned: RentalItem = removeUndefinedFields({
    ...item,
    id,
    createdAt: now,
    updatedAt: now,
  });

  // 1. Immediately update local storage and broadcast
  const current = getStoredItems<RentalItem>(RENTAL_ITEMS_STORAGE_KEY, INITIAL_RENTAL_ITEMS);
  const updatedList = [cleaned, ...current.filter((i) => i.id !== id)];
  saveStoredItems(RENTAL_ITEMS_STORAGE_KEY, updatedList, RENTAL_ITEMS_SYNC_EVENT);

  // 2. Non-blocking background sync to Firestore
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, 'rental_items', id);
    await setDoc(docRef, cleaned);
  }, 1200, `Add rental item ${id}`);

  return id;
}

export async function updateRentalItem(id: string, updates: Partial<RentalItem>): Promise<void> {
  // 1. Immediately update local storage
  const current = getStoredItems<RentalItem>(RENTAL_ITEMS_STORAGE_KEY, INITIAL_RENTAL_ITEMS);
  const fallbackItem = INITIAL_RENTAL_ITEMS.find((i) => i.id === id);
  const existing = current.find((i) => i.id === id) || fallbackItem || { id, name: '', brand: '', categoryId: '', categoryName: '', pricePerDay: 0, imageUrl: '', gallery: [], sizes: [], description: '', available: true };
  const cleaned: RentalItem = removeUndefinedFields({
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  });

  const updatedList = current.map((i) => (i.id === id ? cleaned : i));
  if (!updatedList.some((i) => i.id === id)) {
    updatedList.push(cleaned);
  }
  saveStoredItems(RENTAL_ITEMS_STORAGE_KEY, updatedList, RENTAL_ITEMS_SYNC_EVENT);

  // 2. Non-blocking background sync to Firestore
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, 'rental_items', id);
    await setDoc(docRef, cleaned, { merge: true });
  }, 1200, `Update rental item ${id}`);
}

export async function deleteRentalItem(id: string): Promise<void> {
  // 1. Immediately update local storage
  const current = getStoredItems<RentalItem>(RENTAL_ITEMS_STORAGE_KEY, INITIAL_RENTAL_ITEMS);
  const updatedList = current.filter((i) => i.id !== id);
  saveStoredItems(RENTAL_ITEMS_STORAGE_KEY, updatedList, RENTAL_ITEMS_SYNC_EVENT);

  // 2. Non-blocking background sync to Firestore
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, 'rental_items', id);
    await deleteDoc(docRef);
  }, 1200, `Delete rental item ${id}`);
}

export async function seedInitialRentalsIfEmpty(): Promise<boolean> {
  try {
    const catCol = collection(db, 'rental_categories');
    const catSnap = await getDocs(catCol);
    const existingCatIds = new Set(catSnap.docs.map((d) => d.id));
    const batch = writeBatch(db);
    let count = 0;

    INITIAL_RENTAL_CATEGORIES.forEach((cat) => {
      if (!existingCatIds.has(cat.id)) {
        const dRef = doc(db, 'rental_categories', cat.id);
        batch.set(dRef, cat);
        count++;
      }
    });

    const itemCol = collection(db, 'rental_items');
    const itemSnap = await getDocs(itemCol);
    const existingItemIds = new Set(itemSnap.docs.map((d) => d.id));

    INITIAL_RENTAL_ITEMS.forEach((item) => {
      if (!existingItemIds.has(item.id)) {
        const dRef = doc(db, 'rental_items', item.id);
        batch.set(dRef, item);
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seedRentals');
    return false;
  }
}

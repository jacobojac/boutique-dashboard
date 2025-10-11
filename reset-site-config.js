const { PrismaClient } = require('./src/lib/generated/prisma');

const prisma = new PrismaClient();

async function resetSiteConfig() {
  try {
    // Supprimer toutes les entrées existantes
    console.log('Suppression de toutes les configurations existantes...');
    await prisma.siteConfig.deleteMany({});

    // Nouvelles données de defaultConfigs
    const defaultConfigs = [
      // Hero Section
      {
        key: "homepage_hero_image",
        value: "/images/banniere.png",
        type: "image",
        section: "homepage",
        description: "Image principale de la page d'accueil",
      },
      {
        key: "homepage_hero_title",
        value: "Ta personnalité mérite le meilleur style",
        type: "text",
        section: "homepage",
        description: "Titre principal de la page d'accueil",
      },
      {
        key: "homepage_hero_subtitle",
        value: "Nouvelle Collection",
        type: "text",
        section: "homepage",
        description: "Sous-titre de la page d'accueil",
      },
      {
        key: "homepage_hero_button_text",
        value: "Découvrir la collection",
        type: "text",
        section: "homepage",
        description: "Texte du bouton",
      },

      // Categories Section
      {
        key: "categories_section_title",
        value: "Nos catégories",
        type: "text",
        section: "categories",
        description: "Titre de la section catégories",
      },
      {
        key: "categories_section_description",
        value: "Découvrez notre sélection soigneusement choisie pour chaque style et occasion",
        type: "text",
        section: "categories",
        description: "Description de la section catégories",
      },

      // Categories 1-4
      {
        key: "category_1_name",
        value: "Vêtements Femme",
        type: "text",
        section: "categories",
        description: "Nom de la catégorie 1",
      },
      {
        key: "category_1_subtitle",
        value: "ÉLEGANCE & Confort",
        type: "text",
        section: "categories",
        description: "Sous-titre de la catégorie 1",
      },
      {
        key: "category_1_button_text",
        value: "Découvrir",
        type: "text",
        section: "categories",
        description: "Texte du bouton catégorie 1",
      },
      {
        key: "category_1_link",
        value: "/store/vetements-femme",
        type: "text",
        section: "categories",
        description: "Lien de la catégorie 1",
      },
      {
        key: "category_1_image",
        value: "/images/category-femme.jpg",
        type: "image",
        section: "categories",
        description: "Image de la catégorie 1",
      },

      {
        key: "category_2_name",
        value: "Vêtements Homme",
        type: "text",
        section: "categories",
        description: "Nom de la catégorie 2",
      },
      {
        key: "category_2_subtitle",
        value: "Style & Performace",
        type: "text",
        section: "categories",
        description: "Sous-titre de la catégorie 2",
      },
      {
        key: "category_2_button_text",
        value: "Explorer",
        type: "text",
        section: "categories",
        description: "Texte du bouton catégorie 2",
      },
      {
        key: "category_2_link",
        value: "/store/vetements-homme",
        type: "text",
        section: "categories",
        description: "Lien de la catégorie 2",
      },
      {
        key: "category_2_image",
        value: "/images/category-homme.jpg",
        type: "image",
        section: "categories",
        description: "Image de la catégorie 2",
      },

      {
        key: "category_3_name",
        value: "Chaussures femme",
        type: "text",
        section: "categories",
        description: "Nom de la catégorie 3",
      },
      {
        key: "category_3_subtitle",
        value: "Tendance & Qualité",
        type: "text",
        section: "categories",
        description: "Sous-titre de la catégorie 3",
      },
      {
        key: "category_3_button_text",
        value: "Voir tout",
        type: "text",
        section: "categories",
        description: "Texte du bouton catégorie 3",
      },
      {
        key: "category_3_link",
        value: "/store/accessoires",
        type: "text",
        section: "categories",
        description: "Lien de la catégorie 3",
      },
      {
        key: "category_3_image",
        value: "/images/category-accessoires.jpg",
        type: "image",
        section: "categories",
        description: "Image de la catégorie 3",
      },

      {
        key: "category_4_name",
        value: "Chaussures homme",
        type: "text",
        section: "categories",
        description: "Nom de la catégorie 4",
      },
      {
        key: "category_4_subtitle",
        value: "Confort & Durabilité",
        type: "text",
        section: "categories",
        description: "Sous-titre de la catégorie 4",
      },
      {
        key: "category_4_button_text",
        value: "Découvrir",
        type: "text",
        section: "categories",
        description: "Texte du bouton catégorie 4",
      },
      {
        key: "category_4_link",
        value: "/store/chaussures",
        type: "text",
        section: "categories",
        description: "Lien de la catégorie 4",
      },
      {
        key: "category_4_image",
        value: "/images/category-chaussures.jpg",
        type: "image",
        section: "categories",
        description: "Image de la catégorie 4",
      },

      // Promo Section
      {
        key: "promo_section_image",
        value: "/images/promo-background.jpg",
        type: "image",
        section: "promo",
        description: "Image de fond de la section promotionnelle",
      },
      {
        key: "promo_section_title",
        value: "LIMITED OFFER",
        type: "text",
        section: "promo",
        description: "Titre de la section promotionnelle",
      },
      {
        key: "promo_section_description",
        value: "Des arrivages permanents pour tous les goûts.",
        type: "text",
        section: "promo",
        description: "Description de la section promotionnelle",
      },
    ];

    // Ajouter toutes les nouvelles configurations
    console.log(`Ajout de ${defaultConfigs.length} nouvelles configurations...`);
    
    for (const config of defaultConfigs) {
      await prisma.siteConfig.create({
        data: config
      });
    }

    console.log('✅ Toutes les configurations ont été réinitialisées avec succès');
    
    // Afficher un résumé
    const count = await prisma.siteConfig.count();
    console.log(`📊 Total des configurations : ${count}`);

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetSiteConfig();
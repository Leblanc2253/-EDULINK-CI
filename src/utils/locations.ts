/**
 * Données complètes des Grandes Régions et Districts Autonomes de Côte d'Ivoire
 * et de leurs Départements / Circonscriptions / Sous-préfectures et Communes.
 */

export interface LocationHierarchy {
  districtOrRegion: string;
  type: 'DISTRICT_AUTONOME' | 'REGION';
  capital: string;
  circos: string[];
}

export const CI_REGIONS_AND_CIRCOS: LocationHierarchy[] = [
  {
    districtOrRegion: 'District Autonome d\'Abidjan',
    type: 'DISTRICT_AUTONOME',
    capital: 'Abidjan',
    circos: [
      'Abidjan - Cocody (Angré, Riviera, Deux-Plateaux)',
      'Abidjan - Yopougon (Niangon, Siporex, Maroc)',
      'Abidjan - Plateau (Centre administratif)',
      'Abidjan - Marcory (Zone 4, Biétry, Anoumabo)',
      'Abidjan - Koumassi (Remblais, Soweto, Camp)',
      'Abidjan - Port-Bouët (Vridi, Gonzagueville)',
      'Abidjan - Abobo (Abobo Baoulé, PK18, Belle-ville)',
      'Abidjan - Adjamé (220 Logements, Paillet)',
      'Abidjan - Treichville (Arras, Avenue 8)',
      'Abidjan - Attécoubé (Locodjro, Abobo-Doumé)',
      'Abidjan - Bingerville (Blanchon, Feh Kessé)',
      'Abidjan - Songon (Songon-Agban, Songon-Dagbé)',
      'Abidjan - Anyama (Ahouabo, Belle-ville)'
    ]
  },
  {
    districtOrRegion: 'District Autonome de Yamoussoukro',
    type: 'DISTRICT_AUTONOME',
    capital: 'Yamoussoukro',
    circos: [
      'Yamoussoukro Commune (Habitat, 220 Logements, Morofé)',
      'Yamoussoukro - Kossou',
      'Attiégouakro Commune',
      'Attiégouakro - Lolobo'
    ]
  },
  {
    districtOrRegion: 'Gbêkê (Vallée du Bandama)',
    type: 'REGION',
    capital: 'Bouaké',
    circos: [
      'Bouaké (Ahougnanssou, Dar-es-Salam, Koko, Nimbo, Broukro)',
      'Béoumi (Commune & Sous-préfecture)',
      'Sakassou (Commune & Sous-préfecture)',
      'Botro (Diabo, Krofoinsou, Languibonou)',
      'Djébonoua',
      'Brobo',
      'Marabadiassa'
    ]
  },
  {
    districtOrRegion: 'San-Pédro (Bas-Sassandra)',
    type: 'REGION',
    capital: 'San-Pédro',
    circos: [
      'San-Pédro (Bardot, Cité, Balmer, Sewéké)',
      'Tabou (Commune, Grabo, Dapo-Iboké)',
      'Grand-Béréby',
      'Doba',
      'Gabiadji'
    ]
  },
  {
    districtOrRegion: 'Haut-Sassandra (Sassandra-Marahoué)',
    type: 'REGION',
    capital: 'Daloa',
    circos: [
      'Daloa (Labia, Lobia, Tazibouo, Gbeuliville)',
      'Issia (Commune, Boguédia, Tapeguia)',
      'Vavoua (Commune, Dania, Setisfla)',
      'Zoukougbeu',
      'Bédiala',
      'Saïoua'
    ]
  },
  {
    districtOrRegion: 'Poro (Savanes)',
    type: 'REGION',
    capital: 'Korhogo',
    circos: [
      'Korhogo (Soba, Koko, Petit Paris, Sinistré)',
      'Ferkessédougou',
      'Sinématiali',
      'Dikodougou',
      'M\'Bengué',
      'Tioroniaradougou',
      'Napié'
    ]
  },
  {
    districtOrRegion: 'Tonkpi (Montagnes)',
    type: 'REGION',
    capital: 'Man',
    circos: [
      'Man (Grand Gbapleu, Domoraud, Koko, Libreville)',
      'Danané (Commune, Daleu, Mahapleu)',
      'Biankouma (Commune, Gouiné, Santa)',
      'Zouan-Hounien',
      'Sipilou',
      'Logoualé',
      'Sangouiné'
    ]
  },
  {
    districtOrRegion: 'Gôh (Gôh-Djiboua)',
    type: 'REGION',
    capital: 'Gagnoa',
    circos: [
      'Gagnoa (Dioulabougou, Babré, Garahio, Soleil)',
      'Oumé (Commune, Diégonéfla, Tonla)',
      'Guibéroua',
      'Ouragahio',
      'Gnagbodougnoa',
      'Bayota'
    ]
  },
  {
    districtOrRegion: 'Lôh-Djiboua (Gôh-Djiboua)',
    type: 'REGION',
    capital: 'Divo',
    circos: [
      'Divo (Bada, Dougako, Konankro, Grémian)',
      'Lakota (Commune, Djidji, Gagoré)',
      'Guitry (Commune, Dhirobaro, Lauzoua)',
      'Hiré',
      'Zikisso'
    ]
  },
  {
    districtOrRegion: 'Indénié-Djuablin (Comoé)',
    type: 'REGION',
    capital: 'Abengourou',
    circos: [
      'Abengourou (Agnikro, Plateau, Cafetou, Adonikro)',
      'Agnibilékrou (Commune, Duffrebo, Tanguélan)',
      'Bettié',
      'Niablé',
      'Yakassé-Feyassé',
      'Amélékia'
    ]
  },
  {
    districtOrRegion: 'Sud-Comoé (Comoé)',
    type: 'REGION',
    capital: 'Aboisso',
    circos: [
      'Aboisso (Commerce, Rive Gauche, Sokoura)',
      'Grand-Bassam (Quartier France, Moossou, Impérial)',
      'Bonoua (Commune, Bongo)',
      'Adiaké (Commune, Assinie-Mafia, Etuéboué)',
      'Tiapoum',
      'Maféré'
    ]
  },
  {
    districtOrRegion: 'Grands-Ponts (Lagunes)',
    type: 'REGION',
    capital: 'Dabou',
    circos: [
      'Dabou (Commune, Lopou, Toupah)',
      'Grand-Lahou (Commune, Toukouzou, Bacanda)',
      'Jacqueville (Commune, Attoutou)'
    ]
  },
  {
    districtOrRegion: 'La Mé (Lagunes)',
    type: 'REGION',
    capital: 'Adzopé',
    circos: [
      'Adzopé (Commune, Agou, Assikoi)',
      'Akoupé (Commune, Affery, Bécouéfin)',
      'Alépé (Commune, Aboisso-Comoé, Danguira)',
      'Yakassé-Attobrou'
    ]
  },
  {
    districtOrRegion: 'Agnéby-Tiassa (Lagunes)',
    type: 'REGION',
    capital: 'Agboville',
    circos: [
      'Agboville (Commune, Grand-Morié, Azaguié, Rubino)',
      'Tiassalé (Commune, Morokro, Gbolouville)',
      'Sikensi (Commune, Gomon)',
      'Taabo (Commune, Pacobo)'
    ]
  },
  {
    districtOrRegion: 'N\'Zi (Lacs)',
    type: 'REGION',
    capital: 'Dimbokro',
    circos: [
      'Dimbokro (Commune, Abigui, Diangokro)',
      'Bocanda (Commune, Kouassi-Kouassikro)',
      'Kouassi-Kouassikro',
      'Bengassou'
    ]
  },
  {
    districtOrRegion: 'Iffou (Lacs)',
    type: 'REGION',
    capital: 'Daoukro',
    circos: [
      'Daoukro (Commune, Ananda, Ettrokro)',
      'M\'Bahiakro (Commune, Bonguéra)',
      'Prikro (Commune, Famienkro)',
      'Ouellé'
    ]
  },
  {
    districtOrRegion: 'Bélier (Lacs)',
    type: 'REGION',
    capital: 'Toumodi',
    circos: [
      'Toumodi (Commune, Angoda, Djékanou)',
      'Tiébissou (Commune, Lomokankro)',
      'Didievi (Commune, Molonou, Raviart)',
      'Djékanou'
    ]
  },
  {
    districtOrRegion: 'Moronou (Lacs)',
    type: 'REGION',
    capital: 'Bongouanou',
    circos: [
      'Bongouanou (Commune, Andé, N\'Guessankro)',
      'Arrah (Commune, Krégbé)',
      'M\'Batto (Commune, Anoumaba, Assié-Koumassi)'
    ]
  },
  {
    districtOrRegion: 'Marahoué (Sassandra-Marahoué)',
    type: 'REGION',
    capital: 'Bouaflé',
    circos: [
      'Bouaflé (Commune, Bonon, Pakouabo)',
      'Sinfra (Commune, Bazré, Kononfla)',
      'Zuénoula (Commune, Gohitafla)',
      'Bonon',
      'Gohitafla'
    ]
  },
  {
    districtOrRegion: 'Cavally (Montagnes)',
    type: 'REGION',
    capital: 'Guiglo',
    circos: [
      'Guiglo (Commune, Nizahon, Béoué)',
      'Duékoué (Commune, Bangolo, Bagohouo)',
      'Toulepleu (Commune, Péhé, Méo)',
      'Taï',
      'Blolequin'
    ]
  },
  {
    districtOrRegion: 'Guémon (Montagnes)',
    type: 'REGION',
    capital: 'Duékoué',
    circos: [
      'Duékoué (Commune, Guézon, Fengolo)',
      'Bangolo (Commune, Zou, Bléniméouin)',
      'Kouibly',
      'Facobly'
    ]
  },
  {
    districtOrRegion: 'Tchologo (Savanes)',
    type: 'REGION',
    capital: 'Ferkessédougou',
    circos: [
      'Ferkessédougou (Commune, Koumbala, Togoniéré)',
      'Ouangolodougou (Commune, Diawala, Toumoukoro)',
      'Kong (Commune, Bilimono, Nafana)'
    ]
  },
  {
    districtOrRegion: 'Bagoué (Savanes)',
    type: 'REGION',
    capital: 'Boundiali',
    circos: [
      'Boundiali (Commune, Ganaoni, Kouto)',
      'Tingréla (Commune, Kanakono, Débété)',
      'Kouto (Commune, Kolia, Gbon)',
      'Gbon',
      'Kolia'
    ]
  },
  {
    districtOrRegion: 'Worodougou (Woroba)',
    type: 'REGION',
    capital: 'Séguéla',
    circos: [
      'Séguéla (Commune, Dualla, Massala, Worofla)',
      'Kani (Commune, Djibrosso, Fadiadougou)',
      'Morondo'
    ]
  },
  {
    districtOrRegion: 'Bafing (Woroba)',
    type: 'REGION',
    capital: 'Touba',
    circos: [
      'Touba (Commune, Guintéguéla, Koonan)',
      'Koro (Commune, Borotou, Booko)',
      'Ouaninou'
    ]
  },
  {
    districtOrRegion: 'Béré (Woroba)',
    type: 'REGION',
    capital: 'Mankono',
    circos: [
      'Mankono (Commune, Bouandougou, Marandallah)',
      'Kounahiri (Commune, Kongasso)',
      'Dianra'
    ]
  },
  {
    districtOrRegion: 'Gontougo (Zanzan)',
    type: 'REGION',
    capital: 'Bondoukou',
    circos: [
      'Bondoukou (Commune, Gouméré, Tabagne)',
      'Tanda (Commune, Amanvi, Diamba)',
      'Koun-Fao (Commune, Kokoun)',
      'Sandégué',
      'Transua'
    ]
  },
  {
    districtOrRegion: 'Bounkani (Zanzan)',
    type: 'REGION',
    capital: 'Bouna',
    circos: [
      'Bouna (Commune, Bouko, Ondéfidouo)',
      'Doropo (Commune, Danoa, Niamoué)',
      'Nassian',
      'Téhini'
    ]
  },
  {
    districtOrRegion: 'Hambol (Vallée du Bandama)',
    type: 'REGION',
    capital: 'Katiola',
    circos: [
      'Katiola (Commune, Fronan, Timbé)',
      'Dabakala (Commune, Bassawa, Boniérédougou)',
      'Niakaramandougou (Commune, Tafiré, Arikokaha)',
      'Tafiré'
    ]
  },
  {
    districtOrRegion: 'Nawa (Bas-Sassandra)',
    type: 'REGION',
    capital: 'Soubré',
    circos: [
      'Soubré (Commune, Grand-Zattry, Liliyo, Okrouyo)',
      'Méagui (Commune, Oupoyo)',
      'Buyo',
      'Guéyo'
    ]
  },
  {
    districtOrRegion: 'Gbôklè (Bas-Sassandra)',
    type: 'REGION',
    capital: 'Sassandra',
    circos: [
      'Sassandra (Commune, Dakpadou, Sago)',
      'Fresco (Commune, Gbagbam)'
    ]
  },
  {
    districtOrRegion: 'Folon (Denguélé)',
    type: 'REGION',
    capital: 'Minignan',
    circos: [
      'Minignan (Commune, Kimbirila-Nord, Sokoro)',
      'Kaniasso (Commune, Goulia, Mahandiana-Sokourani)'
    ]
  },
  {
    districtOrRegion: 'Kabadougou (Denguélé)',
    type: 'REGION',
    capital: 'Odienné',
    circos: [
      'Odienné (Commune, Bako, Dioulatiédougou, Samatiguila)',
      'Madinani',
      'Gbéléban',
      'Samatiguila',
      'Séguélon'
    ]
  }
];

// Flat list for quick fallback & dropdown options
export const ALL_CI_LOCATIONS: string[] = CI_REGIONS_AND_CIRCOS.flatMap(r => [
  r.districtOrRegion,
  ...r.circos
]);

export const CI_REGION_NAMES: string[] = CI_REGIONS_AND_CIRCOS.map(r => r.districtOrRegion);

/**
 * Returns all departments/circonscriptions for a given region or district name
 */
export function getDepartmentsForRegion(regionName: string): string[] {
  if (!regionName) return [];
  const found = CI_REGIONS_AND_CIRCOS.find(
    r => r.districtOrRegion.toLowerCase() === regionName.toLowerCase() ||
         r.districtOrRegion.toLowerCase().startsWith(regionName.toLowerCase()) ||
         regionName.toLowerCase().includes(r.districtOrRegion.toLowerCase())
  );
  return found ? found.circos : [];
}

/**
 * Get capital or main city for a region
 */
export function getRegionCapital(regionName: string): string {
  const found = CI_REGIONS_AND_CIRCOS.find(
    r => r.districtOrRegion.toLowerCase() === regionName.toLowerCase()
  );
  return found ? found.capital : '';
}

/**
 * Detect region and department from any stored location string
 */
export function parseLocation(locString: string): { region: string; department: string } {
  if (!locString) return { region: '', department: '' };

  for (const r of CI_REGIONS_AND_CIRCOS) {
    if (r.districtOrRegion === locString) {
      return { region: r.districtOrRegion, department: '' };
    }
    const matchingCirco = r.circos.find(c => c === locString || locString.includes(c) || c.includes(locString));
    if (matchingCirco) {
      return { region: r.districtOrRegion, department: matchingCirco };
    }
  }

  // Check partial match
  for (const r of CI_REGIONS_AND_CIRCOS) {
    if (locString.toLowerCase().includes(r.capital.toLowerCase()) || 
        r.circos.some(c => locString.toLowerCase().includes(c.toLowerCase()))) {
      return { region: r.districtOrRegion, department: locString };
    }
  }

  return { region: '', department: locString };
}

/**
 * Filter regions and their nested circonscriptions based on user query
 */
export function searchLocations(query: string): { region: LocationHierarchy; matchingCircos: string[] }[] {
  if (!query || !query.trim()) {
    return CI_REGIONS_AND_CIRCOS.map(r => ({ region: r, matchingCircos: r.circos }));
  }

  const clean = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const results: { region: LocationHierarchy; matchingCircos: string[] }[] = [];

  for (const item of CI_REGIONS_AND_CIRCOS) {
    const regionClean = item.districtOrRegion.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const capitalClean = item.capital.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const isRegionMatch = regionClean.includes(clean) || capitalClean.includes(clean);

    const matchingCircos = item.circos.filter(circo => {
      const circoClean = circo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return circoClean.includes(clean);
    });

    if (isRegionMatch) {
      // If region matches, return all its circos (with any specific circo matches on top)
      results.push({
        region: item,
        matchingCircos: item.circos
      });
    } else if (matchingCircos.length > 0) {
      results.push({
        region: item,
        matchingCircos
      });
    }
  }

  return results;
}

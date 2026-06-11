// ─────────────────────────────────────────────
// ALERTIO — packages/core/src/romeTree.ts
// Liste complète des codes ROME v4 officiels
// Source : France Travail / data.gouv.fr
// ─────────────────────────────────────────────

import type { RomeProximity } from "./types";

export interface RomeNode {
  code:         string;
  label:        string;
  domain:       string;
  subDomain:    string;
  relatedCodes: string[];
  keywords:     string[];
}

export function searchRome(query: string, limit = 10): RomeNode[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().trim();
  return ROME_NODES.filter(n =>
    n.code.toLowerCase().includes(q) ||
    n.label.toLowerCase().includes(q) ||
    n.keywords.some(k => k.toLowerCase().includes(q))
  ).slice(0, limit);
}

export function getRomeByCode(code: string): RomeNode | undefined {
  return ROME_NODES.find(n => n.code === code);
}

export function getRomeByDomain(domain: string): RomeNode[] {
  return ROME_NODES.filter(n => n.domain === domain);
}

const ROME_NODES: RomeNode[] = [

  // ── A — Agriculture, Marine, Pêche ──────────────────────────────────────
  { code:"A1101", label:"Conduite de cultures légumières et maraîchères",          domain:"A", subDomain:"11", relatedCodes:["A1102","A1103"], keywords:["maraîcher","légumes","culture","serre","jardin"] },
  { code:"A1102", label:"Horticulture et pépinière",                               domain:"A", subDomain:"11", relatedCodes:["A1101","A1104"], keywords:["horticulteur","fleurs","pépinière","plantes","jardinerie"] },
  { code:"A1103", label:"Conduite de cultures céréalières et industrielles",       domain:"A", subDomain:"11", relatedCodes:["A1101","A1301"], keywords:["céréales","blé","maïs","agriculture","exploitation"] },
  { code:"A1104", label:"Viticulture",                                             domain:"A", subDomain:"11", relatedCodes:["A1102","A1301"], keywords:["vigne","viticulteur","vin","vignoble","raisin"] },
  { code:"A1201", label:"Bûcheronnage et élagage",                                domain:"A", subDomain:"12", relatedCodes:["A1202","A1203"], keywords:["bûcheron","arbre","forêt","élagage","tronçonneuse"] },
  { code:"A1202", label:"Entretien des espaces naturels",                          domain:"A", subDomain:"12", relatedCodes:["A1201","A1203"], keywords:["espaces verts","parc","nature","environnement","entretien"] },
  { code:"A1203", label:"Entretien des espaces verts",                             domain:"A", subDomain:"12", relatedCodes:["A1202","A1301"], keywords:["jardinier","pelouse","tonte","paysagiste","espaces verts"] },
  { code:"A1204", label:"Protection du patrimoine naturel",                        domain:"A", subDomain:"12", relatedCodes:["A1202","A1203"], keywords:["nature","environnement","biodiversité","garde","patrimoine"] },
  { code:"A1205", label:"Sylviculture",                                            domain:"A", subDomain:"12", relatedCodes:["A1201","A1202"], keywords:["forêt","sylviculteur","bois","plantation","reboisement"] },
  { code:"A1301", label:"Conseil et assistance technique en agriculture",          domain:"A", subDomain:"13", relatedCodes:["A1103","A1401"], keywords:["conseil","agronome","technique","agriculture","ingénieur"] },
  { code:"A1302", label:"Direction d'exploitation agricole",                       domain:"A", subDomain:"13", relatedCodes:["A1301","A1401"], keywords:["directeur","exploitation","agricole","gestion","ferme"] },
  { code:"A1303", label:"Ingénierie en agriculture et environnement naturel",      domain:"A", subDomain:"13", relatedCodes:["A1301","A1302"], keywords:["ingénieur","agri","environnement","agronomie","R&D"] },
  { code:"A1401", label:"Aide agricole de production fruitière ou viticole",       domain:"A", subDomain:"14", relatedCodes:["A1104","A1402"], keywords:["fruits","cueillette","récolte","verger","saison"] },
  { code:"A1402", label:"Aide agricole de production légumière ou végétale",       domain:"A", subDomain:"14", relatedCodes:["A1101","A1401"], keywords:["maraîchage","légumes","saisonnier","récolte","culture"] },
  { code:"A1403", label:"Aide d'élevage agricole et aquacole",                     domain:"A", subDomain:"14", relatedCodes:["A1501","A1402"], keywords:["élevage","animaux","ferme","aquaculture","saisonnier"] },
  { code:"A1501", label:"Élevage bovin et équin",                                  domain:"A", subDomain:"15", relatedCodes:["A1502","A1503"], keywords:["vaches","chevaux","éleveur","bovin","équin"] },
  { code:"A1502", label:"Élevage porcin",                                          domain:"A", subDomain:"15", relatedCodes:["A1501","A1503"], keywords:["porcs","élevage","porcin","cochons","ferme"] },
  { code:"A1503", label:"Élevage d'ovins et de caprins",                           domain:"A", subDomain:"15", relatedCodes:["A1501","A1502"], keywords:["moutons","chèvres","brebis","ovins","caprins"] },
  { code:"A1504", label:"Élevage de lapins et volailles",                          domain:"A", subDomain:"15", relatedCodes:["A1503","A1505"], keywords:["lapins","poulets","volailles","aviculture","élevage"] },
  { code:"A1505", label:"Apiculture",                                              domain:"A", subDomain:"15", relatedCodes:["A1504","A1102"], keywords:["abeilles","miel","ruche","apiculteur","pollinisation"] },
  { code:"A1506", label:"Pisciculture",                                            domain:"A", subDomain:"15", relatedCodes:["A1401","A1403"], keywords:["poissons","aquaculture","pisciculture","élevage","eau"] },
  { code:"A2101", label:"Inspection sanitaire et qualité en agroalimentaire",      domain:"A", subDomain:"21", relatedCodes:["A1301","A2102"], keywords:["qualité","contrôle","sanitaire","alimentation","HACCP"] },
  { code:"A2102", label:"Recherche et développement en agriculture",               domain:"A", subDomain:"21", relatedCodes:["A1303","A2101"], keywords:["recherche","R&D","agronomie","laboratoire","innovation"] },
  { code:"A3101", label:"Aquaculture",                                             domain:"A", subDomain:"31", relatedCodes:["A1506","A3201"], keywords:["aquaculture","mer","poissons","élevage","maritime"] },
  { code:"A3201", label:"Pêche en mer et littoral",                                domain:"A", subDomain:"32", relatedCodes:["A3101","A3202"], keywords:["pêche","marin","bateau","mer","filet"] },
  { code:"A3202", label:"Pêche en eau douce",                                      domain:"A", subDomain:"32", relatedCodes:["A3201","A3101"], keywords:["pêche","rivière","lac","eau douce","poisson"] },

  // ── B — Arts et façonnage d'ouvrages d'art ───────────────────────────────
  { code:"B1101", label:"Création en arts plastiques",                             domain:"B", subDomain:"11", relatedCodes:["B1201","B1301"], keywords:["artiste","peinture","sculpture","arts plastiques","création"] },
  { code:"B1201", label:"Réalisation d'objets décoratifs et artistiques en verre", domain:"B", subDomain:"12", relatedCodes:["B1101","B1202"], keywords:["verre","vitrail","souffleur","verrerie","artisanat"] },
  { code:"B1202", label:"Verrerie scientifique et industrielle",                   domain:"B", subDomain:"12", relatedCodes:["B1201","H2901"], keywords:["verre","laboratoire","industriel","verrerie","chimie"] },
  { code:"B1301", label:"Décoration d'espaces de vente et d'exposition",           domain:"B", subDomain:"13", relatedCodes:["B1101","B1302"], keywords:["décorateur","vitrine","exposition","design","aménagement"] },
  { code:"B1302", label:"Décoration d'objets d'art et artisanaux",                 domain:"B", subDomain:"13", relatedCodes:["B1301","B1101"], keywords:["artisan","décoration","dorure","peinture","restauration"] },
  { code:"B1401", label:"Réalisation d'ouvrages en bijouterie-joaillerie",         domain:"B", subDomain:"14", relatedCodes:["B1402","B1403"], keywords:["bijoutier","joaillier","or","argent","bijoux"] },
  { code:"B1402", label:"Réalisation d'ouvrages en orfèvrerie",                   domain:"B", subDomain:"14", relatedCodes:["B1401","B1403"], keywords:["orfèvre","argent","métal","artisanat","bijou"] },
  { code:"B1403", label:"Réalisation d'ouvrages en horlogerie",                   domain:"B", subDomain:"14", relatedCodes:["B1401","B1402"], keywords:["horloger","montre","mécanique","réparation","horlogerie"] },
  { code:"B1501", label:"Fabrication et réparation d'instruments de musique",     domain:"B", subDomain:"15", relatedCodes:["B1401","B1601"], keywords:["luthier","instrument","musique","réparation","artisan"] },
  { code:"B1601", label:"Métiers d'art céramiques et poterie",                    domain:"B", subDomain:"16", relatedCodes:["B1201","B1101"], keywords:["céramiste","potier","argile","faïence","terre"] },
  { code:"B1602", label:"Gravure et taille de matériaux",                         domain:"B", subDomain:"16", relatedCodes:["B1601","B1101"], keywords:["graveur","taille","pierre","bois","artisanat"] },
  { code:"B1603", label:"Réalisation d'ouvrages en marqueterie",                  domain:"B", subDomain:"16", relatedCodes:["B1602","B1701"], keywords:["marqueteur","bois","ébéniste","incrustations","artisan"] },
  { code:"B1701", label:"Conservation et restauration de biens culturels",        domain:"B", subDomain:"17", relatedCodes:["B1101","B1302"], keywords:["restaurateur","patrimoine","conservation","musée","art"] },
  { code:"B1702", label:"Métiers d'art du textile",                               domain:"B", subDomain:"17", relatedCodes:["B1601","B1701"], keywords:["tissage","broderie","tapisserie","textile","artisan"] },
  { code:"B2101", label:"Fabrication en ameublement",                             domain:"B", subDomain:"21", relatedCodes:["B1603","B2102"], keywords:["menuisier","ébéniste","meuble","bois","fabrication"] },
  { code:"B2102", label:"Réalisation de meubles en bois",                         domain:"B", subDomain:"21", relatedCodes:["B2101","B2103"], keywords:["ébéniste","menuiserie","bois","meuble","artisan"] },
  { code:"B2103", label:"Tapisserie et garnissage",                               domain:"B", subDomain:"21", relatedCodes:["B2102","B1702"], keywords:["tapissier","garnissage","tissu","sellerie","restauration"] },
  { code:"B2201", label:"Reliure et restauration de livres",                      domain:"B", subDomain:"22", relatedCodes:["B1701","B2202"], keywords:["relieur","livre","papier","restauration","bibliophilie"] },
  { code:"B2202", label:"Métiers de l'imprimerie",                                domain:"B", subDomain:"22", relatedCodes:["B2201","H2304"], keywords:["imprimeur","impression","offset","typographie","print"] },
  { code:"B3101", label:"Taille de pierre",                                       domain:"B", subDomain:"31", relatedCodes:["B1602","F1603"], keywords:["tailleur de pierre","marbre","façade","sculpture","BTP"] },
  { code:"B3201", label:"Soufflage de verre",                                     domain:"B", subDomain:"32", relatedCodes:["B1201","B1202"], keywords:["souffleur","verre","artisan","artisanat","chalumeau"] },

  // ── C — Banque, Assurance, Immobilier ───────────────────────────────────
  { code:"C1101", label:"Gestion de clientèle bancaire",                          domain:"C", subDomain:"11", relatedCodes:["C1102","C1201"], keywords:["banquier","conseiller","client","banque","crédit"] },
  { code:"C1102", label:"Conseil en gestion de patrimoine financier",             domain:"C", subDomain:"11", relatedCodes:["C1101","C1103"], keywords:["patrimoine","conseiller","finance","investissement","gestion"] },
  { code:"C1103", label:"Direction de clientèle bancaire",                        domain:"C", subDomain:"11", relatedCodes:["C1101","C1102"], keywords:["directeur","banque","agence","manager","commercial"] },
  { code:"C1104", label:"Direction d'exploitation bancaire",                      domain:"C", subDomain:"11", relatedCodes:["C1103","C1201"], keywords:["direction","banque","exploitation","management","finance"] },
  { code:"C1201", label:"Analyse et ingénierie financière",                       domain:"C", subDomain:"12", relatedCodes:["C1101","C1202"], keywords:["analyste","finance","ingénieur","modèle","valorisation"] },
  { code:"C1202", label:"Audit et contrôle bancaires et financiers",              domain:"C", subDomain:"12", relatedCodes:["C1201","C1203"], keywords:["auditeur","contrôle","bancaire","conformité","risques"] },
  { code:"C1203", label:"Contrôle de gestion bancaire et financière",             domain:"C", subDomain:"12", relatedCodes:["C1202","M1204"], keywords:["contrôleur","gestion","budget","finance","reporting"] },
  { code:"C1204", label:"Direction des crédits",                                  domain:"C", subDomain:"12", relatedCodes:["C1101","C1201"], keywords:["crédit","risque","direction","banque","analyse"] },
  { code:"C1205", label:"Études actuarielles en assurances",                      domain:"C", subDomain:"12", relatedCodes:["C1201","C1301"], keywords:["actuaire","assurance","statistiques","risques","mathématiques"] },
  { code:"C1206", label:"Gestion de portefeuilles",                               domain:"C", subDomain:"12", relatedCodes:["C1201","C1102"], keywords:["portefeuille","trader","asset management","fonds","bourse"] },
  { code:"C1207", label:"Management des risques bancaires et financiers",         domain:"C", subDomain:"12", relatedCodes:["C1202","C1204"], keywords:["risk manager","risques","compliance","bâle","bancaire"] },
  { code:"C1301", label:"Développement et direction commerciale assurance",       domain:"C", subDomain:"13", relatedCodes:["C1302","D1401"], keywords:["assurance","commercial","directeur","développement","vente"] },
  { code:"C1302", label:"Expertise risques en assurances",                        domain:"C", subDomain:"13", relatedCodes:["C1205","C1301"], keywords:["expert","risque","assurance","évaluation","sinistre"] },
  { code:"C1303", label:"Gestion de l'information et de la documentation",        domain:"C", subDomain:"13", relatedCodes:["C1302","M1402"], keywords:["documentaliste","information","gestion","archive","veille"] },
  { code:"C1401", label:"Gestion en banque et assurance",                         domain:"C", subDomain:"14", relatedCodes:["C1101","C1301"], keywords:["gestionnaire","back office","banque","assurance","opérations"] },
  { code:"C1402", label:"Souscription d'assurances",                              domain:"C", subDomain:"14", relatedCodes:["C1301","C1302"], keywords:["souscripteur","assurance","contrat","tarification","risques"] },
  { code:"C1501", label:"Direction de développement immobilier",                  domain:"C", subDomain:"15", relatedCodes:["C1502","C1503"], keywords:["promoteur","immobilier","développement","directeur","programme"] },
  { code:"C1502", label:"Gestion et transactions immobilières",                   domain:"C", subDomain:"15", relatedCodes:["C1501","C1503"], keywords:["agent immobilier","transaction","vente","location","immobilier"] },
  { code:"C1503", label:"Management de projet immobilier",                        domain:"C", subDomain:"15", relatedCodes:["C1501","C1502"], keywords:["chef de projet","immobilier","promotion","maîtrise d'ouvrage"] },
  { code:"C1504", label:"Transaction immobilière",                                domain:"C", subDomain:"15", relatedCodes:["C1502","D1214"], keywords:["négociateur","immobilier","vente","achat","agence"] },

  // ── D — Commerce, Vente, Grande Distribution ─────────────────────────────
  { code:"D1101", label:"Boucherie",                                              domain:"D", subDomain:"11", relatedCodes:["D1102","D1103"], keywords:["boucher","viande","boucherie","charcuterie","découpe"] },
  { code:"D1102", label:"Boulangerie - viennoiserie",                             domain:"D", subDomain:"11", relatedCodes:["D1103","D1104"], keywords:["boulanger","pain","viennoiserie","four","pâtisserie"] },
  { code:"D1103", label:"Charcuterie - traiteur",                                 domain:"D", subDomain:"11", relatedCodes:["D1101","D1102"], keywords:["charcutier","traiteur","salaisons","charcuterie","cuisine"] },
  { code:"D1104", label:"Pâtisserie, confiserie, chocolaterie et glacerie",       domain:"D", subDomain:"11", relatedCodes:["D1102","D1103"], keywords:["pâtissier","chocolatier","confiseur","glacier","dessert"] },
  { code:"D1105", label:"Poissonnerie",                                           domain:"D", subDomain:"11", relatedCodes:["D1101","D1106"], keywords:["poissonnier","poisson","fruits de mer","marée","poissonnerie"] },
  { code:"D1106", label:"Fromage et crèmerie",                                    domain:"D", subDomain:"11", relatedCodes:["D1105","D1101"], keywords:["fromager","crémier","fromage","lait","affineur"] },
  { code:"D1107", label:"Vente en alimentation",                                  domain:"D", subDomain:"11", relatedCodes:["D1101","D1211"], keywords:["caissier","vendeur","alimentaire","épicerie","supermarché"] },
  { code:"D1108", label:"Encaissement et service en station-service",             domain:"D", subDomain:"11", relatedCodes:["D1107","D1211"], keywords:["station service","caisse","encaissement","carburant"] },
  { code:"D1201", label:"Achat vente articles d'occasion",                        domain:"D", subDomain:"12", relatedCodes:["D1202","D1211"], keywords:["occasion","brocante","seconde main","achat","vente"] },
  { code:"D1202", label:"Coiffure",                                               domain:"D", subDomain:"12", relatedCodes:["D1203","D1204"], keywords:["coiffeur","salon","cheveux","coupe","coloration"] },
  { code:"D1203", label:"Esthétique et cosmétique",                               domain:"D", subDomain:"12", relatedCodes:["D1202","D1204"], keywords:["esthéticienne","beauté","soin","cosmétique","onglerie"] },
  { code:"D1204", label:"Manucure et maquillage professionnel",                   domain:"D", subDomain:"12", relatedCodes:["D1203","D1202"], keywords:["manucure","maquillage","ongles","beauté","nail art"] },
  { code:"D1205", label:"Vente de végétaux",                                      domain:"D", subDomain:"12", relatedCodes:["A1102","D1211"], keywords:["fleuriste","jardinerie","plantes","végétaux","fleurs"] },
  { code:"D1206", label:"Vente en alimentation spécialisée",                      domain:"D", subDomain:"12", relatedCodes:["D1107","D1211"], keywords:["vendeur","spécialisé","bio","cave","épicerie fine"] },
  { code:"D1207", label:"Vente en animalerie",                                    domain:"D", subDomain:"12", relatedCodes:["D1205","D1211"], keywords:["animalerie","animaux","vente","pet shop","soins"] },
  { code:"D1208", label:"Vente en décoration et équipement de la maison",         domain:"D", subDomain:"12", relatedCodes:["D1211","D1209"], keywords:["vendeur","décoration","meuble","maison","bricolage"] },
  { code:"D1209", label:"Vente en habillement et accessoires de la personne",     domain:"D", subDomain:"12", relatedCodes:["D1208","D1211"], keywords:["vendeur","mode","vêtements","boutique","prêt-à-porter"] },
  { code:"D1210", label:"Vente en gros de matières premières",                    domain:"D", subDomain:"12", relatedCodes:["D1211","N1103"], keywords:["grossiste","achat","vente","matières premières","commerce"] },
  { code:"D1211", label:"Vente en magasin de détail",                             domain:"D", subDomain:"12", relatedCodes:["D1107","D1209"], keywords:["vendeur","magasin","détail","commerce","retail"] },
  { code:"D1212", label:"Vente en véhicules et pièces détachées",                 domain:"D", subDomain:"12", relatedCodes:["D1211","I1604"], keywords:["vendeur","automobile","concession","pièces","moto"] },
  { code:"D1213", label:"Vente en produits culturels et loisirs",                 domain:"D", subDomain:"12", relatedCodes:["D1211","D1209"], keywords:["librairie","musique","jeux","culture","loisirs"] },
  { code:"D1214", label:"Vente en immobilier",                                    domain:"D", subDomain:"12", relatedCodes:["C1502","C1504"], keywords:["agent immobilier","transaction","vente","mandataire"] },
  { code:"D1301", label:"Management de magasin de détail",                        domain:"D", subDomain:"13", relatedCodes:["D1211","D1302"], keywords:["responsable","directeur","magasin","retail","manager"] },
  { code:"D1302", label:"Direction de magasin de grande distribution",            domain:"D", subDomain:"13", relatedCodes:["D1301","D1303"], keywords:["directeur","supermarché","hypermarché","grande distribution"] },
  { code:"D1303", label:"Direction de site e-commerce",                           domain:"D", subDomain:"13", relatedCodes:["D1302","M1803"], keywords:["e-commerce","directeur","digital","online","marketplace"] },
  { code:"D1401", label:"Management relation clientèle",                          domain:"D", subDomain:"14", relatedCodes:["D1402","D1403"], keywords:["relation client","CRM","manager","service client","fidélisation"] },
  { code:"D1402", label:"Relation commerciale grands comptes et entreprises",     domain:"D", subDomain:"14", relatedCodes:["D1401","D1403"], keywords:["grands comptes","commercial","B2B","key account","entreprises"] },
  { code:"D1403", label:"Relation commerciale en vente de services",              domain:"D", subDomain:"14", relatedCodes:["D1401","D1402"], keywords:["commercial","services","vente","BtoB","prospection"] },
  { code:"D1404", label:"Télémarketing et télévente",                             domain:"D", subDomain:"14", relatedCodes:["D1401","D1405"], keywords:["télévendeur","call center","prospection","téléphone","vente"] },
  { code:"D1405", label:"Conseil en information médicale",                        domain:"D", subDomain:"14", relatedCodes:["D1404","J1304"], keywords:["délégué médical","pharma","médecin","visite","promotion"] },
  { code:"D1406", label:"Management de force de vente",                           domain:"D", subDomain:"14", relatedCodes:["D1401","D1402"], keywords:["directeur commercial","force de vente","manager","équipe","vente"] },
  { code:"D1407", label:"Relation technico-commerciale",                          domain:"D", subDomain:"14", relatedCodes:["D1403","D1408"], keywords:["technico-commercial","ingénieur commercial","technique","vente"] },
  { code:"D1408", label:"Téléconseil et télévente",                               domain:"D", subDomain:"14", relatedCodes:["D1404","D1401"], keywords:["conseiller","centre d'appels","client","téléphone","hotline"] },
  { code:"D1409", label:"Vente à distance",                                       domain:"D", subDomain:"14", relatedCodes:["D1404","D1303"], keywords:["e-commerce","vente en ligne","VAD","digital","chargé"] },

  // ── E — Communication, Médias, Multimédia ───────────────────────────────
  { code:"E1101", label:"Animation de site multimédia",                           domain:"E", subDomain:"11", relatedCodes:["E1102","E1103"], keywords:["community manager","animateur","web","réseaux sociaux","contenu"] },
  { code:"E1102", label:"Écriture d'ouvrages, de livres",                         domain:"E", subDomain:"11", relatedCodes:["E1101","E1103"], keywords:["écrivain","auteur","rédacteur","livre","roman"] },
  { code:"E1103", label:"Communication",                                          domain:"E", subDomain:"11", relatedCodes:["E1101","E1104"], keywords:["chargé de communication","relations presse","RP","attaché","événement"] },
  { code:"E1104", label:"Conception de contenus multimédias",                     domain:"E", subDomain:"11", relatedCodes:["E1101","E1103"], keywords:["concepteur","multimédia","contenu","digital","créatif"] },
  { code:"E1105", label:"Coordination d'édition",                                 domain:"E", subDomain:"11", relatedCodes:["E1102","E1106"], keywords:["éditeur","édition","coordination","livre","publication"] },
  { code:"E1106", label:"Journalisme et information média",                       domain:"E", subDomain:"11", relatedCodes:["E1103","E1105"], keywords:["journaliste","reporter","rédaction","presse","média"] },
  { code:"E1107", label:"Organisation d'événementiels",                           domain:"E", subDomain:"11", relatedCodes:["E1103","G1101"], keywords:["événementiel","organisateur","séminaire","conférence","chef de projet"] },
  { code:"E1108", label:"Traduction, interprétariat",                             domain:"E", subDomain:"11", relatedCodes:["E1106","M1604"], keywords:["traducteur","interprète","langues","traduction","localisation"] },
  { code:"E1201", label:"Photographie",                                           domain:"E", subDomain:"12", relatedCodes:["E1202","E1101"], keywords:["photographe","photo","reportage","studio","image"] },
  { code:"E1202", label:"Réalisation de contenus audiovisuels",                   domain:"E", subDomain:"12", relatedCodes:["E1201","E1301"], keywords:["réalisateur","vidéo","audiovisuel","tournage","cinéma"] },
  { code:"E1301", label:"Conception et développement web",                        domain:"E", subDomain:"13", relatedCodes:["E1302","M1805"], keywords:["développeur web","HTML","CSS","JavaScript","intégrateur"] },
  { code:"E1302", label:"Production audiovisuelle",                               domain:"E", subDomain:"13", relatedCodes:["E1202","E1301"], keywords:["producteur","audiovisuel","tournage","post-production","TV"] },
  { code:"E1303", label:"Montage audiovisuel",                                    domain:"E", subDomain:"13", relatedCodes:["E1302","E1304"], keywords:["monteur","vidéo","post-production","motion design","éditing"] },
  { code:"E1304", label:"Réalisation cinématographique et audiovisuelle",         domain:"E", subDomain:"13", relatedCodes:["E1302","E1303"], keywords:["réalisateur","cinéma","film","audiovisuel","direction"] },
  { code:"E1305", label:"Techniques d'enregistrement sonore",                    domain:"E", subDomain:"13", relatedCodes:["E1303","L1503"], keywords:["ingénieur du son","studio","son","enregistrement","mixage"] },
  { code:"E1306", label:"Direction artistique",                                   domain:"E", subDomain:"13", relatedCodes:["E1101","B1101"], keywords:["directeur artistique","DA","créatif","design","pub"] },
  { code:"E1401", label:"Développement et promotion publicitaire",                domain:"E", subDomain:"14", relatedCodes:["E1103","D1406"], keywords:["publicité","commercial","pub","agence","développement"] },
  { code:"E1402", label:"Élaboration de plan média",                              domain:"E", subDomain:"14", relatedCodes:["E1401","E1403"], keywords:["media planner","achat médias","plan","publicité","stratégie"] },
  { code:"E1403", label:"Production de films et programmes",                      domain:"E", subDomain:"14", relatedCodes:["E1302","E1304"], keywords:["producteur","films","séries","TV","audiovisuel"] },

  // ── F — Construction, BTP ────────────────────────────────────────────────
  { code:"F1101", label:"Architecture du bâtiment et des villes",                 domain:"F", subDomain:"11", relatedCodes:["F1102","F1201"], keywords:["architecte","bâtiment","urbanisme","construction","projet"] },
  { code:"F1102", label:"Conception et dessin de produits électriques",           domain:"F", subDomain:"11", relatedCodes:["F1101","F1103"], keywords:["dessinateur","électrique","CAO","plans","bureau d'études"] },
  { code:"F1103", label:"Contrôle et diagnostic technique du bâtiment",           domain:"F", subDomain:"11", relatedCodes:["F1101","F1201"], keywords:["diagnostiqueur","DPE","amiante","plomb","immobilier"] },
  { code:"F1104", label:"Dessin BTP et travaux publics",                          domain:"F", subDomain:"11", relatedCodes:["F1101","F1102"], keywords:["dessinateur","BTP","CAO","DAO","plans"] },
  { code:"F1105", label:"Études géotechniques",                                   domain:"F", subDomain:"11", relatedCodes:["F1104","F1201"], keywords:["géotechnicien","sol","fondations","géologie","études"] },
  { code:"F1106", label:"Ingénierie et études du BTP",                            domain:"F", subDomain:"11", relatedCodes:["F1101","F1201"], keywords:["ingénieur","BTP","études","bureau","structure"] },
  { code:"F1107", label:"Mesures topographiques",                                 domain:"F", subDomain:"11", relatedCodes:["F1105","F1104"], keywords:["géomètre","topographe","mesures","terrain","cadastre"] },
  { code:"F1108", label:"Réalisation de maquettes et prototypes",                 domain:"F", subDomain:"11", relatedCodes:["F1101","B2101"], keywords:["maquettiste","modèle","prototype","architecture","3D"] },
  { code:"F1201", label:"Conduite de travaux du BTP",                             domain:"F", subDomain:"12", relatedCodes:["F1106","F1202"], keywords:["conducteur de travaux","BTP","chantier","management","suivi"] },
  { code:"F1202", label:"Direction de chantier du BTP",                           domain:"F", subDomain:"12", relatedCodes:["F1201","F1203"], keywords:["directeur","chantier","BTP","travaux","responsable"] },
  { code:"F1203", label:"Direction et ingénierie d'exploitation de gisements",    domain:"F", subDomain:"12", relatedCodes:["F1202","F1105"], keywords:["mine","carrière","extraction","directeur","ingénieur"] },
  { code:"F1204", label:"Qualité sécurité en BTP",                                domain:"F", subDomain:"12", relatedCodes:["F1201","F1106"], keywords:["QSE","sécurité","qualité","BTP","prévention"] },
  { code:"F1301", label:"Électricité bâtiment tertiaire",                         domain:"F", subDomain:"13", relatedCodes:["F1302","F1303"], keywords:["électricien","courant fort","installation","bâtiment","câblage"] },
  { code:"F1302", label:"Électricité industrielle",                               domain:"F", subDomain:"13", relatedCodes:["F1301","F1303"], keywords:["électricien","industriel","automatisme","installation","maintenance"] },
  { code:"F1303", label:"Installation en télécommunications et courants faibles",  domain:"F", subDomain:"13", relatedCodes:["F1301","I1304"], keywords:["télécoms","courants faibles","fibre","réseau","installation"] },
  { code:"F1401", label:"Isolation thermique et acoustique",                      domain:"F", subDomain:"14", relatedCodes:["F1402","F1601"], keywords:["isolation","thermique","acoustique","bardage","RGE"] },
  { code:"F1402", label:"Menuiserie agenceur",                                    domain:"F", subDomain:"14", relatedCodes:["F1401","F1403"], keywords:["menuisier","bois","agencement","fenêtres","portes"] },
  { code:"F1403", label:"Réalisation de structures légères et couverture",        domain:"F", subDomain:"14", relatedCodes:["F1401","F1601"], keywords:["charpentier","couvreur","toiture","structure","bois"] },
  { code:"F1404", label:"Serrurerie et metallerie",                               domain:"F", subDomain:"14", relatedCodes:["F1402","H2906"], keywords:["serrurier","métallerie","ferronnerie","grilles","acier"] },
  { code:"F1501", label:"Carrelage et revêtements de sol",                        domain:"F", subDomain:"15", relatedCodes:["F1502","F1503"], keywords:["carreleur","carrelage","sol","pose","revêtement"] },
  { code:"F1502", label:"Peinture en bâtiment",                                   domain:"F", subDomain:"15", relatedCodes:["F1501","F1503"], keywords:["peintre","bâtiment","décoration","enduit","ravalement"] },
  { code:"F1503", label:"Plâtrerie et isolation",                                 domain:"F", subDomain:"15", relatedCodes:["F1501","F1502"], keywords:["plâtrier","placo","cloison","isolation","staff"] },
  { code:"F1504", label:"Pose de fermetures menuisées",                           domain:"F", subDomain:"15", relatedCodes:["F1402","F1503"], keywords:["menuisier","fenêtres","portes","pose","fermetures"] },
  { code:"F1601", label:"Application de résines de synthèse",                     domain:"F", subDomain:"16", relatedCodes:["F1501","F1602"], keywords:["résine","sol","application","imperméabilisation","chape"] },
  { code:"F1602", label:"Maçonnerie",                                             domain:"F", subDomain:"16", relatedCodes:["F1603","F1601"], keywords:["maçon","béton","mur","construction","gros œuvre"] },
  { code:"F1603", label:"Réalisation et restauration de façades",                 domain:"F", subDomain:"16", relatedCodes:["F1602","B3101"], keywords:["façadier","ravalement","enduit","façade","restauration"] },
  { code:"F1604", label:"Montage de structures et de charpentes bois",            domain:"F", subDomain:"16", relatedCodes:["F1403","F1602"], keywords:["charpentier","ossature bois","structure","montage","bois"] },
  { code:"F1605", label:"Montage levage",                                         domain:"F", subDomain:"16", relatedCodes:["F1602","N1105"], keywords:["monteur","levage","grue","chantier","assemblage"] },
  { code:"F1606", label:"Pose de revêtements souples",                            domain:"F", subDomain:"16", relatedCodes:["F1501","F1503"], keywords:["poseur","moquette","parquet","vinyle","revêtement"] },
  { code:"F1607", label:"Pose et entretien de vitrage",                           domain:"F", subDomain:"16", relatedCodes:["F1504","F1606"], keywords:["vitrier","verre","façade","double vitrage","pose"] },
  { code:"F1608", label:"Préparation du gros œuvre et des travaux",               domain:"F", subDomain:"16", relatedCodes:["F1602","F1605"], keywords:["manœuvre","coffreur","ferrailleur","gros œuvre","chantier"] },
  { code:"F1701", label:"Construction en béton",                                  domain:"F", subDomain:"17", relatedCodes:["F1602","F1702"], keywords:["bétonnier","béton","construction","ouvrage","génie civil"] },
  { code:"F1702", label:"Construction de routes et voies",                        domain:"F", subDomain:"17", relatedCodes:["F1701","F1703"], keywords:["cantonnier","routes","TP","voirie","enrobé"] },
  { code:"F1703", label:"Construction d'ouvrages d'art et de génie civil",        domain:"F", subDomain:"17", relatedCodes:["F1701","F1702"], keywords:["génie civil","pont","tunnels","ouvrage","ingénieur"] },
  { code:"F1704", label:"Pose de canalisations",                                  domain:"F", subDomain:"17", relatedCodes:["F1702","I1301"], keywords:["canalisateur","tuyaux","réseau","eau","assainissement"] },
  { code:"F1705", label:"Terrassement",                                           domain:"F", subDomain:"17", relatedCodes:["F1702","F1704"], keywords:["terrassier","engins","excavation","bulldozer","chantier"] },

  // ── G — Hôtellerie, Restauration, Tourisme ───────────────────────────────
  { code:"G1101", label:"Accueil touristique",                                    domain:"G", subDomain:"11", relatedCodes:["G1102","G1201"], keywords:["accueil","tourisme","réceptionniste","hôtel","office du tourisme"] },
  { code:"G1102", label:"Promotion du tourisme local",                            domain:"G", subDomain:"11", relatedCodes:["G1101","G1103"], keywords:["tourisme","promotion","local","guide","office"] },
  { code:"G1103", label:"Management d'hôtel-restaurant",                          domain:"G", subDomain:"11", relatedCodes:["G1101","G1201"], keywords:["directeur","hôtel","restaurant","manager","hôtellerie"] },
  { code:"G1104", label:"Animation de loisirs sportifs",                          domain:"G", subDomain:"11", relatedCodes:["G1102","G1105"], keywords:["animateur","sport","loisirs","activités","club"] },
  { code:"G1105", label:"Conduite de véhicules touristiques et de loisirs",       domain:"G", subDomain:"11", relatedCodes:["G1101","N4102"], keywords:["guide","chauffeur","tourisme","excursion","car"] },
  { code:"G1201", label:"Réception en hôtellerie",                                domain:"G", subDomain:"12", relatedCodes:["G1101","G1202"], keywords:["réceptionniste","hôtel","accueil","nuit","front office"] },
  { code:"G1202", label:"Personnel de hall d'hôtel et de résidence",             domain:"G", subDomain:"12", relatedCodes:["G1201","G1203"], keywords:["bagagiste","groom","voiturier","concierge","hôtel"] },
  { code:"G1203", label:"Gestion de structure de loisirs ou d'hébergement",      domain:"G", subDomain:"12", relatedCodes:["G1201","G1202"], keywords:["directeur","hébergement","camping","résidence","gestion"] },
  { code:"G1204", label:"Animation d'activités culturelles ou ludiques",          domain:"G", subDomain:"12", relatedCodes:["G1104","G1101"], keywords:["animateur","culturel","ludique","atelier","activités"] },
  { code:"G1301", label:"Conception de voyages",                                  domain:"G", subDomain:"13", relatedCodes:["G1302","G1101"], keywords:["agent de voyages","tour opérateur","package","tourisme"] },
  { code:"G1302", label:"Optimisation de voyages en entreprise",                  domain:"G", subDomain:"13", relatedCodes:["G1301","G1101"], keywords:["travel manager","déplacements","business travel","corporate"] },
  { code:"G1401", label:"Assistance de direction d'hôtel-restaurant",            domain:"G", subDomain:"14", relatedCodes:["G1103","G1201"], keywords:["assistant","direction","hôtel","restaurant","secrétaire"] },
  { code:"G1402", label:"Direction d'hôtel-restaurant",                           domain:"G", subDomain:"14", relatedCodes:["G1103","G1401"], keywords:["directeur","hôtel","restaurant","gestion","management"] },
  { code:"G1403", label:"Gestion de structure de restauration collective",        domain:"G", subDomain:"14", relatedCodes:["G1402","G1501"], keywords:["responsable","restauration collective","cantine","catering"] },
  { code:"G1404", label:"Management de restaurant",                               domain:"G", subDomain:"14", relatedCodes:["G1402","G1501"], keywords:["manager","restaurant","service","équipe","responsable"] },
  { code:"G1405", label:"Sommellerie",                                            domain:"G", subDomain:"14", relatedCodes:["G1501","G1402"], keywords:["sommelier","vin","cave","dégustation","restaurant"] },
  { code:"G1501", label:"Café, bar brasserie",                                    domain:"G", subDomain:"15", relatedCodes:["G1502","G1503"], keywords:["barman","serveur","café","bar","brasserie"] },
  { code:"G1502", label:"Personnel de cuisine",                                   domain:"G", subDomain:"15", relatedCodes:["G1503","G1504"], keywords:["cuisinier","chef","cuisine","brigade","restaurant"] },
  { code:"G1503", label:"Personnel de salle",                                     domain:"G", subDomain:"15", relatedCodes:["G1501","G1502"], keywords:["serveur","salle","restaurant","service","maître d'hôtel"] },
  { code:"G1504", label:"Plonge et préparation culinaire",                        domain:"G", subDomain:"15", relatedCodes:["G1502","G1503"], keywords:["plongeur","préparation","aide-cuisine","commis","restauration"] },
  { code:"G1601", label:"Management du personnel de cuisine",                     domain:"G", subDomain:"16", relatedCodes:["G1502","G1402"], keywords:["chef cuisinier","brigade","management","cuisine","étoilé"] },
  { code:"G1602", label:"Cuisine de collectivité",                                domain:"G", subDomain:"16", relatedCodes:["G1502","G1403"], keywords:["cuisinier","collectivité","cantine","restauration sociale","masse"] },
  { code:"G1603", label:"Cuisine gastronomique",                                  domain:"G", subDomain:"16", relatedCodes:["G1502","G1601"], keywords:["chef","gastronomie","étoile","haute cuisine","restaurant"] },

  // ── H — Industrie ────────────────────────────────────────────────────────
  { code:"H1101", label:"Assistance et support technique client",                  domain:"H", subDomain:"11", relatedCodes:["H1102","H1201"], keywords:["support","technicien","client","SAV","assistance"] },
  { code:"H1102", label:"Management et ingénierie d'affaires industrielles",      domain:"H", subDomain:"11", relatedCodes:["H1101","H1201"], keywords:["ingénieur d'affaires","commercial","industriel","B2B","technico"] },
  { code:"H1201", label:"Assistance technique d'ingénieur",                       domain:"H", subDomain:"12", relatedCodes:["H1101","H1202"], keywords:["technicien","ingénieur","assistance","bureau d'études","support"] },
  { code:"H1202", label:"Management et ingénierie de maintenance industrielle",   domain:"H", subDomain:"12", relatedCodes:["H1201","I1304"], keywords:["maintenance","ingénieur","industriel","management","fiabilité"] },
  { code:"H1203", label:"Conception et dessin produits mécaniques",               domain:"H", subDomain:"12", relatedCodes:["H1204","H1205"], keywords:["dessinateur","mécanique","CAO","SolidWorks","bureau d'études"] },
  { code:"H1204", label:"Design industriel",                                      domain:"H", subDomain:"12", relatedCodes:["H1203","B1101"], keywords:["designer","industriel","produit","design","innovation"] },
  { code:"H1205", label:"Études et conception industrielle",                      domain:"H", subDomain:"12", relatedCodes:["H1203","H1206"], keywords:["ingénieur","bureau d'études","conception","industriel","R&D"] },
  { code:"H1206", label:"Management et ingénierie études, recherche et développement industriels", domain:"H", subDomain:"12", relatedCodes:["H1205","H1301"], keywords:["R&D","ingénieur","recherche","développement","industriel"] },
  { code:"H1207", label:"Rédaction technique",                                    domain:"H", subDomain:"12", relatedCodes:["H1201","E1105"], keywords:["rédacteur technique","documentation","manuel","notice","technique"] },
  { code:"H1208", label:"Intervention technique en études et conception en automatisme", domain:"H", subDomain:"12", relatedCodes:["H1203","H1301"], keywords:["automaticien","automate","PLC","SCADA","robotique"] },
  { code:"H1209", label:"Intervention technique en bureau d'études",              domain:"H", subDomain:"12", relatedCodes:["H1203","H1205"], keywords:["technicien BE","bureau d'études","calcul","conception","plans"] },
  { code:"H1210", label:"Stratégie et direction de la R&D",                       domain:"H", subDomain:"12", relatedCodes:["H1206","M1803"], keywords:["directeur R&D","stratégie","innovation","recherche","CTO"] },
  { code:"H1301", label:"Conduite de système de production automatisé",           domain:"H", subDomain:"13", relatedCodes:["H1302","H1208"], keywords:["conducteur","automate","production","ligne","robotique"] },
  { code:"H1302", label:"Management et ingénierie de production",                 domain:"H", subDomain:"13", relatedCodes:["H1301","H1303"], keywords:["responsable production","ingénieur","management","usine","lean"] },
  { code:"H1303", label:"Intervention technique en fabrication industrielle",     domain:"H", subDomain:"13", relatedCodes:["H1301","H1302"], keywords:["technicien","fabrication","production","usine","régleur"] },
  { code:"H1304", label:"Management et ingénierie HSE",                           domain:"H", subDomain:"13", relatedCodes:["H1302","F1204"], keywords:["HSE","sécurité","environnement","QSE","prévention"] },
  { code:"H1305", label:"Intervention technique en amélioration et ordonnancement de la production", domain:"H", subDomain:"13", relatedCodes:["H1302","H1303"], keywords:["méthodes","ordonnancement","lean","production","amélioration"] },
  { code:"H1401", label:"Management et ingénierie qualité industrielle",          domain:"H", subDomain:"14", relatedCodes:["H1402","H1304"], keywords:["qualité","ingénieur","responsable","ISO","audit"] },
  { code:"H1402", label:"Management et ingénierie de systèmes industriels",       domain:"H", subDomain:"14", relatedCodes:["H1401","H1301"], keywords:["systèmes","ingénieur","industriel","gestion","production"] },
  { code:"H1403", label:"Intervention technique en contrôle essais qualité",      domain:"H", subDomain:"14", relatedCodes:["H1401","H1402"], keywords:["contrôleur","qualité","essais","laboratoire","métrologie"] },
  { code:"H2101", label:"Abattage et découpe de bois",                            domain:"H", subDomain:"21", relatedCodes:["H2102","A1201"], keywords:["scieur","bois","débit","forêt","scierie"] },
  { code:"H2102", label:"Assemblage d'ouvrages en bois",                          domain:"H", subDomain:"21", relatedCodes:["H2101","H2103"], keywords:["menuisier","assemblage","charpente","ossature","bois"] },
  { code:"H2103", label:"Conduite d'installation de production de bois",          domain:"H", subDomain:"21", relatedCodes:["H2101","H2102"], keywords:["conducteur","scierie","bois","production","industriel"] },
  { code:"H2201", label:"Câblage électrique et électromécanique",                 domain:"H", subDomain:"22", relatedCodes:["H2202","F1301"], keywords:["câbleur","électromécanique","armoire","câblage","électricité"] },
  { code:"H2202", label:"Conduite d'équipement de production électrique",         domain:"H", subDomain:"22", relatedCodes:["H2201","H2203"], keywords:["électrotechnicien","production","conduite","centrale","électrique"] },
  { code:"H2203", label:"Électromécanique",                                       domain:"H", subDomain:"22", relatedCodes:["H2201","H2202"], keywords:["électromécanicien","mécanique","électrique","maintenance","réparation"] },
  { code:"H2204", label:"Montage de matériel électrique et électronique",         domain:"H", subDomain:"22", relatedCodes:["H2201","H2301"], keywords:["monteur","électronique","composants","câblage","assemblage"] },
  { code:"H2205", label:"Montage électrique et électronique",                     domain:"H", subDomain:"22", relatedCodes:["H2204","H2301"], keywords:["technicien","électronique","montage","circuits","cartes"] },
  { code:"H2301", label:"Conduite d'équipement d'usinage",                        domain:"H", subDomain:"23", relatedCodes:["H2302","H2303"], keywords:["usineur","tour","fraise","CNC","usinage"] },
  { code:"H2302", label:"Réglage d'équipement de production industrielle",        domain:"H", subDomain:"23", relatedCodes:["H2301","H2303"], keywords:["régleur","machine","production","mise au point","industriel"] },
  { code:"H2303", label:"Traitement thermique et revêtement de matériaux",        domain:"H", subDomain:"23", relatedCodes:["H2301","H2904"], keywords:["traitement thermique","revêtement","trempe","surface","acier"] },
  { code:"H2304", label:"Reprographie",                                           domain:"H", subDomain:"23", relatedCodes:["B2202","H2305"], keywords:["reprographe","copie","impression","documents","reproduction"] },
  { code:"H2305", label:"Conduite de traitement d'imprimerie",                    domain:"H", subDomain:"23", relatedCodes:["B2202","H2304"], keywords:["imprimeur","offset","sérigraphie","impression","pré-presse"] },
  { code:"H2401", label:"Assemblage et montage de matériels",                     domain:"H", subDomain:"24", relatedCodes:["H2402","H2201"], keywords:["monteur","assemblage","production","série","industriel"] },
  { code:"H2402", label:"Conduite de fabrication industrielle",                   domain:"H", subDomain:"24", relatedCodes:["H2401","H1301"], keywords:["conducteur","fabrication","ligne","production","industriel"] },
  { code:"H2403", label:"Pilotage d'installation automatisée de production industrielle", domain:"H", subDomain:"24", relatedCodes:["H2402","H1301"], keywords:["pilote","automate","production","ligne","robotique"] },
  { code:"H2501", label:"Formage de métaux et matériaux",                         domain:"H", subDomain:"25", relatedCodes:["H2502","H2503"], keywords:["formage","métal","presse","emboutissage","forge"] },
  { code:"H2502", label:"Chaudronnerie et tuyauterie industrielle",               domain:"H", subDomain:"25", relatedCodes:["H2501","H2503"], keywords:["chaudronnier","tuyauteur","soudeur","métal","structure"] },
  { code:"H2503", label:"Soudage manuel",                                         domain:"H", subDomain:"25", relatedCodes:["H2502","H2501"], keywords:["soudeur","soudage","MIG","TIG","métal"] },
  { code:"H2504", label:"Conduite d'équipement de métallurgie",                   domain:"H", subDomain:"25", relatedCodes:["H2501","H2503"], keywords:["métallurgiste","haut fourneau","acier","fonderie","métal"] },
  { code:"H2601", label:"Bobinage électrique",                                    domain:"H", subDomain:"26", relatedCodes:["H2201","H2602"], keywords:["bobineur","moteur","transformateur","électrique","rebobinage"] },
  { code:"H2602", label:"Mécanique automobile",                                   domain:"H", subDomain:"26", relatedCodes:["H2603","I1604"], keywords:["mécanicien","auto","garage","moteur","réparation"] },
  { code:"H2603", label:"Mécanique motocycles",                                   domain:"H", subDomain:"26", relatedCodes:["H2602","I1604"], keywords:["mécanicien","moto","2 roues","réparation","moteur"] },
  { code:"H2604", label:"Montage-assemblage mécanique",                           domain:"H", subDomain:"26", relatedCodes:["H2401","H2503"], keywords:["monteur","assemblage","mécanique","production","usine"] },
  { code:"H2701", label:"Pilotage de centrale nucléaire",                         domain:"H", subDomain:"27", relatedCodes:["H2702","H2703"], keywords:["opérateur","nucléaire","centrale","conduite","réacteur"] },
  { code:"H2702", label:"Management et ingénierie de projets industriels nucléaires", domain:"H", subDomain:"27", relatedCodes:["H2701","H2703"], keywords:["ingénieur","nucléaire","projet","management","CEA"] },
  { code:"H2703", label:"Pilotage d'unité de production chimique ou pétrochimique", domain:"H", subDomain:"27", relatedCodes:["H2701","H2702"], keywords:["opérateur","chimie","pétrochimie","raffinage","conduite"] },
  { code:"H2801", label:"Conduite de production agroalimentaire",                 domain:"H", subDomain:"28", relatedCodes:["H2802","H2803"], keywords:["conducteur","agroalimentaire","production","usine","ligne"] },
  { code:"H2802", label:"Fabrication en confiserie, chocolaterie, glacerie",      domain:"H", subDomain:"28", relatedCodes:["H2801","D1104"], keywords:["confiseur","chocolatier","glacier","fabrication","industrie"] },
  { code:"H2803", label:"Fabrication de boissons et produits de fermentation",    domain:"H", subDomain:"28", relatedCodes:["H2801","H2804"], keywords:["brasseur","vigneron","distillateur","fermentation","boissons"] },
  { code:"H2804", label:"Transformation de viandes",                              domain:"H", subDomain:"28", relatedCodes:["H2801","D1101"], keywords:["découpeur","industrie","viande","abattoir","transformation"] },
  { code:"H2805", label:"Conditionnement industriel",                             domain:"H", subDomain:"28", relatedCodes:["H2801","N1301"], keywords:["conditionneur","emballage","packaging","chaîne","industrie"] },
  { code:"H2901", label:"Conduite d'appareil de production chimique",             domain:"H", subDomain:"29", relatedCodes:["H2902","H2703"], keywords:["opérateur","chimie","réacteur","procédé","conduite"] },
  { code:"H2902", label:"Conduite d'équipement de production de verre, céramique et matériaux de construction", domain:"H", subDomain:"29", relatedCodes:["H2901","B1201"], keywords:["opérateur","verre","céramique","four","production"] },
  { code:"H2903", label:"Conduite de préparation de pharmacie",                   domain:"H", subDomain:"29", relatedCodes:["H2901","J1304"], keywords:["préparateur","pharmacie","médicaments","industrie","GMP"] },
  { code:"H2904", label:"Conduite d'équipement de production de matières plastiques et caoutchouc", domain:"H", subDomain:"29", relatedCodes:["H2901","H2303"], keywords:["plasturgie","injection","moule","caoutchouc","production"] },
  { code:"H2905", label:"Conduite d'installation de production papier-carton",    domain:"H", subDomain:"29", relatedCodes:["H2901","H2902"], keywords:["papetier","carton","production","machine","industrie"] },
  { code:"H2906", label:"Métallurgie",                                            domain:"H", subDomain:"29", relatedCodes:["H2504","H2502"], keywords:["métallurgiste","acier","fonderie","forge","alliage"] },
  { code:"H3101", label:"Façonnage et transformation du textile",                 domain:"H", subDomain:"31", relatedCodes:["H3102","H3103"], keywords:["couture","textile","tissage","confection","industrie"] },
  { code:"H3102", label:"Conduite d'équipement de production textile",            domain:"H", subDomain:"31", relatedCodes:["H3101","H3103"], keywords:["conducteur","textile","machine","tissage","fil"] },
  { code:"H3103", label:"Finissage",                                              domain:"H", subDomain:"31", relatedCodes:["H3101","H3102"], keywords:["finition","textile","teinture","apprêt","traitement"] },
  { code:"H3201", label:"Confection",                                             domain:"H", subDomain:"32", relatedCodes:["H3202","H3101"], keywords:["couturier","confection","vêtements","mode","atelier"] },
  { code:"H3202", label:"Patronnage et gradation",                                domain:"H", subDomain:"32", relatedCodes:["H3201","H3203"], keywords:["patronnier","patron","gradation","mode","taille"] },
  { code:"H3203", label:"Chaussure et maroquinerie",                              domain:"H", subDomain:"32", relatedCodes:["H3201","H3202"], keywords:["cordonnier","maroquinier","chaussures","cuir","artisan"] },

  // ── I — Installation et Maintenance ──────────────────────────────────────
  { code:"I1101", label:"Direction et ingénierie en entretien infrastructure et bâti", domain:"I", subDomain:"11", relatedCodes:["I1102","F1201"], keywords:["directeur","facility management","ingénieur","bâtiment","maintenance"] },
  { code:"I1102", label:"Management et ingénierie maintenance industrielle",      domain:"I", subDomain:"11", relatedCodes:["I1101","H1202"], keywords:["maintenance","ingénieur","TPM","GMAO","fiabilité"] },
  { code:"I1103", label:"Supervision d'entretien et gestion de patrimoine immobilier", domain:"I", subDomain:"11", relatedCodes:["I1101","C1502"], keywords:["facility manager","patrimoine","gestion","immobilier","entretien"] },
  { code:"I1201", label:"Entretien de locaux",                                    domain:"I", subDomain:"12", relatedCodes:["I1202","K2204"], keywords:["agent d'entretien","nettoyage","propreté","locaux","ménage"] },
  { code:"I1202", label:"Nettoyage de locaux",                                    domain:"I", subDomain:"12", relatedCodes:["I1201","K2204"], keywords:["nettoyeur","propreté","industrie","locaux","agent"] },
  { code:"I1203", label:"Nettoyage de vitreries",                                 domain:"I", subDomain:"12", relatedCodes:["I1202","F1607"], keywords:["laveur","vitres","façade","nacelle","propreté"] },
  { code:"I1301", label:"Chaudronnerie et tuyauterie",                            domain:"I", subDomain:"13", relatedCodes:["H2502","I1302"], keywords:["chaudronnier","tuyauteur","soudeur","industrie","maintenance"] },
  { code:"I1302", label:"Maintenance des bâtiments et des locaux",                domain:"I", subDomain:"13", relatedCodes:["I1301","I1303"], keywords:["technicien","maintenance","bâtiment","multi-technique","CVC"] },
  { code:"I1303", label:"Maintenance des équipements industriels et d'exploitation", domain:"I", subDomain:"13", relatedCodes:["I1302","H1202"], keywords:["technicien","maintenance","industrielle","équipements","GMAO"] },
  { code:"I1304", label:"Maintenance électrique",                                 domain:"I", subDomain:"13", relatedCodes:["F1301","I1305"], keywords:["électricien","maintenance","dépannage","bâtiment","industriel"] },
  { code:"I1305", label:"Maintenance électronique",                               domain:"I", subDomain:"13", relatedCodes:["I1304","H2204"], keywords:["technicien","électronique","réparation","circuit","maintenance"] },
  { code:"I1306", label:"Réalisation et maintenance de systèmes hydrauliques et pneumatiques", domain:"I", subDomain:"13", relatedCodes:["I1303","H2502"], keywords:["hydraulique","pneumatique","systèmes","maintenance","fluide"] },
  { code:"I1307", label:"Maintenance des systèmes de sécurité et de surveillance", domain:"I", subDomain:"13", relatedCodes:["I1304","K2503"], keywords:["technicien","alarme","sécurité","surveillance","vidéo"] },
  { code:"I1308", label:"Maintenance d'ascenseurs",                               domain:"I", subDomain:"13", relatedCodes:["I1302","I1303"], keywords:["ascensoriste","élévateur","maintenance","monte-charge","réparation"] },
  { code:"I1401", label:"Maintenance informatique et bureautique",                domain:"I", subDomain:"14", relatedCodes:["I1402","M1801"], keywords:["technicien","informatique","maintenance","dépannage","PC"] },
  { code:"I1402", label:"Réparation de biens électrodomestiques",                 domain:"I", subDomain:"14", relatedCodes:["I1401","I1403"], keywords:["réparateur","électroménager","SAV","dépannage","appareil"] },
  { code:"I1403", label:"Réparation de biens électroniques et optiques",          domain:"I", subDomain:"14", relatedCodes:["I1402","H2204"], keywords:["technicien","réparation","électronique","optique","SAV"] },
  { code:"I1404", label:"Réparation en cycles et motocycles",                     domain:"I", subDomain:"14", relatedCodes:["H2603","I1402"], keywords:["réparateur","vélo","moto","2 roues","cycle"] },
  { code:"I1501", label:"Installation de systèmes de distribution d'énergie",    domain:"I", subDomain:"15", relatedCodes:["F1301","I1502"], keywords:["installateur","électricien","énergie","distribution","réseau"] },
  { code:"I1502", label:"Installation d'équipements sanitaires et thermiques",   domain:"I", subDomain:"15", relatedCodes:["I1501","I1503"], keywords:["plombier","chauffagiste","sanitaire","CVC","thermique"] },
  { code:"I1503", label:"Installation en télécommunications",                     domain:"I", subDomain:"15", relatedCodes:["F1303","I1502"], keywords:["installateur","télécom","réseau","fibre","câblage"] },
  { code:"I1601", label:"Installation d'équipements domestiques",                 domain:"I", subDomain:"16", relatedCodes:["I1502","I1602"], keywords:["installateur","électroménager","domotique","maison","équipement"] },
  { code:"I1602", label:"Montage de mobilier",                                    domain:"I", subDomain:"16", relatedCodes:["I1601","B2101"], keywords:["monteur","meuble","assemblage","ikea","installation"] },
  { code:"I1603", label:"Réalisation de structures métalliques",                  domain:"I", subDomain:"16", relatedCodes:["H2502","F1404"], keywords:["charpentier métallique","structure","acier","serrurerie","monteur"] },
  { code:"I1604", label:"Mécanique automobile et entretien de véhicules",         domain:"I", subDomain:"16", relatedCodes:["H2602","H2603"], keywords:["mécanicien","auto","entretien","vidange","garage"] },

  // ── J — Santé ────────────────────────────────────────────────────────────
  { code:"J1101", label:"Médecine de médecins généralistes et spécialistes",      domain:"J", subDomain:"11", relatedCodes:["J1102","J1103"], keywords:["médecin","généraliste","spécialiste","santé","clinique"] },
  { code:"J1102", label:"Médecine dentaire",                                      domain:"J", subDomain:"11", relatedCodes:["J1101","J1103"], keywords:["dentiste","chirurgien-dentiste","orthodontiste","cabinet","soins"] },
  { code:"J1103", label:"Médecine vétérinaire",                                   domain:"J", subDomain:"11", relatedCodes:["J1101","J1102"], keywords:["vétérinaire","animaux","clinique","soins","chirurgie"] },
  { code:"J1104", label:"Pharmacologie",                                          domain:"J", subDomain:"11", relatedCodes:["J1304","J1305"], keywords:["pharmacologue","médicament","recherche","industrie","essais"] },
  { code:"J1105", label:"Ostéopathie",                                            domain:"J", subDomain:"11", relatedCodes:["J1101","J1106"], keywords:["ostéopathe","manipulation","colonne","thérapie","kinésithérapie"] },
  { code:"J1106", label:"Chiropractie",                                           domain:"J", subDomain:"11", relatedCodes:["J1105","J1101"], keywords:["chiropracteur","colonne","vertèbres","manipulation","thérapie"] },
  { code:"J1201", label:"Biologie médicale",                                      domain:"J", subDomain:"12", relatedCodes:["J1202","J1301"], keywords:["biologiste","laboratoire","analyses","médical","diagnostic"] },
  { code:"J1202", label:"Recherche en sciences de la vie et de la santé",         domain:"J", subDomain:"12", relatedCodes:["J1201","J1203"], keywords:["chercheur","sciences","vie","biologie","santé","R&D"] },
  { code:"J1203", label:"Techniques de recherche biomédicale",                    domain:"J", subDomain:"12", relatedCodes:["J1202","J1201"], keywords:["technicien","biomédical","recherche","laboratoire","protocole"] },
  { code:"J1301", label:"Soins en addictologie",                                  domain:"J", subDomain:"13", relatedCodes:["J1302","J1401"], keywords:["addictologie","soins","dépendance","alcool","infirmier"] },
  { code:"J1302", label:"Analyses médicales",                                     domain:"J", subDomain:"13", relatedCodes:["J1201","J1301"], keywords:["technicien de laboratoire","analyses","biologie","prélèvement"] },
  { code:"J1303", label:"Assistance médico-technique",                            domain:"J", subDomain:"13", relatedCodes:["J1302","J1304"], keywords:["aide médico","bloc","stérilisation","matériel","soins"] },
  { code:"J1304", label:"Pharmacie",                                              domain:"J", subDomain:"13", relatedCodes:["J1305","J1104"], keywords:["pharmacien","préparateur","officine","médicaments","dispensation"] },
  { code:"J1305", label:"Préparation et contrôle pharmaceutiques",                domain:"J", subDomain:"13", relatedCodes:["J1304","H2903"], keywords:["préparateur","pharmacie","laboratoire","contrôle","GMP"] },
  { code:"J1306", label:"Radiodiagnostic et imagerie médicale",                   domain:"J", subDomain:"13", relatedCodes:["J1303","J1307"], keywords:["manipulateur","radio","imagerie","scanner","IRM"] },
  { code:"J1307", label:"Soins dentaires",                                        domain:"J", subDomain:"13", relatedCodes:["J1102","J1303"], keywords:["assistant dentaire","soins","cabinet","radiologie","prothèse"] },
  { code:"J1308", label:"Kinésithérapie",                                         domain:"J", subDomain:"13", relatedCodes:["J1309","J1105"], keywords:["kinésithérapeute","rééducation","massage","sport","kiné"] },
  { code:"J1309", label:"Podologie",                                              domain:"J", subDomain:"13", relatedCodes:["J1308","J1101"], keywords:["podologue","pieds","semelles","orthèse","soins"] },
  { code:"J1310", label:"Soins infirmiers en gériatrie",                          domain:"J", subDomain:"13", relatedCodes:["J1401","J1311"], keywords:["infirmier","gériatrie","personnes âgées","EHPAD","soins"] },
  { code:"J1311", label:"Soins infirmiers spécialisés",                           domain:"J", subDomain:"13", relatedCodes:["J1401","J1310"], keywords:["infirmier spécialisé","réanimation","bloc","IADE","IBODE"] },
  { code:"J1312", label:"Techniques de la culture cellulaire",                    domain:"J", subDomain:"13", relatedCodes:["J1202","J1201"], keywords:["biologie cellulaire","culture","laboratoire","cellules","recherche"] },
  { code:"J1401", label:"Soins généraux",                                         domain:"J", subDomain:"14", relatedCodes:["J1402","J1311"], keywords:["infirmier","soins","patient","hôpital","IDE"] },
  { code:"J1402", label:"Soins et services pour animaux de compagnie",            domain:"J", subDomain:"14", relatedCodes:["J1103","J1401"], keywords:["vétérinaire","auxiliaire","animaux","soins","clinique"] },
  { code:"J1403", label:"Soins et traitements naturels",                          domain:"J", subDomain:"14", relatedCodes:["J1105","J1401"], keywords:["naturopathe","thérapies","naturel","homéopathie","bien-être"] },
  { code:"J1404", label:"Soins d'hygiène et de confort du patient",               domain:"J", subDomain:"14", relatedCodes:["J1401","K2104"], keywords:["aide-soignant","AS","hygiène","confort","patient"] },
  { code:"J1405", label:"Rééducation orthophonique",                              domain:"J", subDomain:"14", relatedCodes:["J1308","J1401"], keywords:["orthophoniste","langage","parole","rééducation","enfant"] },
  { code:"J1406", label:"Ergothérapie",                                           domain:"J", subDomain:"14", relatedCodes:["J1308","J1405"], keywords:["ergothérapeute","autonomie","handicap","rééducation","adaptation"] },
  { code:"J1407", label:"Psychomotricité",                                        domain:"J", subDomain:"14", relatedCodes:["J1406","J1405"], keywords:["psychomotricien","corps","développement","enfant","rééducation"] },
  { code:"J1501", label:"Coordination médico-sociale",                            domain:"J", subDomain:"15", relatedCodes:["J1502","K1201"], keywords:["coordinateur","médico-social","réseau","CLIC","parcours"] },
  { code:"J1502", label:"Gestion de structure de service social",                 domain:"J", subDomain:"15", relatedCodes:["J1501","K1201"], keywords:["directeur","social","EHPAD","IME","gestion"] },
  { code:"J1503", label:"Médiation en santé et développement de réseaux de soins", domain:"J", subDomain:"15", relatedCodes:["J1501","J1101"], keywords:["médiateur","santé","réseau","coordination","accès aux soins"] },

  // ── K — Services à la personne et à la collectivité ──────────────────────
  { code:"K1101", label:"Accompagnement et médiation familiale",                  domain:"K", subDomain:"11", relatedCodes:["K1102","K1201"], keywords:["médiateur","famille","accompagnement","social","travailleur"] },
  { code:"K1102", label:"Aide aux bénéficiaires d'une mesure de protection juridique", domain:"K", subDomain:"11", relatedCodes:["K1101","K1201"], keywords:["mandataire","tutelle","curatelle","juridique","protection"] },
  { code:"K1103", label:"Développement personnel et bien être de la personne",    domain:"K", subDomain:"11", relatedCodes:["K1101","K1104"], keywords:["coach","développement personnel","bien-être","accompagnement","sophrologie"] },
  { code:"K1104", label:"Psychologie",                                            domain:"K", subDomain:"11", relatedCodes:["K1103","J1101"], keywords:["psychologue","thérapie","clinique","comportement","soin"] },
  { code:"K1105", label:"Réalisation de soins esthétiques et corporels",          domain:"K", subDomain:"11", relatedCodes:["D1203","K1103"], keywords:["esthéticienne","spa","bien-être","massage","soins"] },
  { code:"K1201", label:"Action sociale",                                         domain:"K", subDomain:"12", relatedCodes:["K1202","K1101"], keywords:["travailleur social","assistant social","ASS","aide","inclusion"] },
  { code:"K1202", label:"Éducation de jeunes enfants",                            domain:"K", subDomain:"12", relatedCodes:["K1201","K1203"], keywords:["éducateur","crèche","petite enfance","nourrisson","ATSEM"] },
  { code:"K1203", label:"Enseignement",                                           domain:"K", subDomain:"12", relatedCodes:["K1202","K1204"], keywords:["enseignant","professeur","école","lycée","collège"] },
  { code:"K1204", label:"Animation de groupes et formation des adultes",          domain:"K", subDomain:"12", relatedCodes:["K1203","K1301"], keywords:["formateur","animation","adultes","pédagogie","groupe"] },
  { code:"K1205", label:"Conseil en emploi et insertion professionnelle",         domain:"K", subDomain:"12", relatedCodes:["K1201","K1204"], keywords:["conseiller emploi","France Travail","insertion","orientation","bilan"] },
  { code:"K1206", label:"Coopération internationale et développement humanitaire", domain:"K", subDomain:"12", relatedCodes:["K1201","K1205"], keywords:["humanitaire","ONG","coopération","international","développement"] },
  { code:"K1207", label:"Administration de l'Éducation nationale et de l'enseignement supérieur", domain:"K", subDomain:"12", relatedCodes:["K1203","M1602"], keywords:["administration","éducation","nationale","directeur","rectorat"] },
  { code:"K1301", label:"Accompagnement médicosocial",                            domain:"K", subDomain:"13", relatedCodes:["K1302","J1501"], keywords:["éducateur spécialisé","accompagnement","handicap","social","médico"] },
  { code:"K1302", label:"Assistance auprès d'adultes",                            domain:"K", subDomain:"13", relatedCodes:["K1301","K2104"], keywords:["auxiliaire de vie","aide à domicile","personnes âgées","soin","AVS"] },
  { code:"K1303", label:"Assistance auprès d'enfants",                            domain:"K", subDomain:"13", relatedCodes:["K1302","K1202"], keywords:["nourrice","assistante maternelle","baby-sitter","garde","enfant"] },
  { code:"K1304", label:"Aide familiale",                                         domain:"K", subDomain:"13", relatedCodes:["K1302","K1303"], keywords:["aide familiale","famille","domicile","social","soutien"] },
  { code:"K1305", label:"Intervention sociale et familiale",                      domain:"K", subDomain:"13", relatedCodes:["K1304","K1201"], keywords:["technicien intervention sociale","famille","aide","TISF","social"] },
  { code:"K1401", label:"Animation culturelle, sportive et de loisirs",           domain:"K", subDomain:"14", relatedCodes:["K1402","G1104"], keywords:["animateur","BAFA","sport","culturel","centre de loisirs"] },
  { code:"K1402", label:"Direction des ressources humaines",                      domain:"K", subDomain:"14", relatedCodes:["K1401","M1503"], keywords:["DRH","ressources humaines","direction","RH","management"] },
  { code:"K1403", label:"Management de structure de loisirs ou d'hébergement",   domain:"K", subDomain:"14", relatedCodes:["K1401","G1203"], keywords:["directeur","centre de loisirs","camping","hébergement","gestion"] },
  { code:"K1404", label:"Sport",                                                  domain:"K", subDomain:"14", relatedCodes:["K1401","K1405"], keywords:["entraîneur","coach sportif","éducateur sportif","sport","BPJEPS"] },
  { code:"K1405", label:"Entraînement sportif",                                   domain:"K", subDomain:"14", relatedCodes:["K1404","K1401"], keywords:["entraîneur","athlète","préparation physique","performance","sport"] },
  { code:"K2101", label:"Consultation de médecine générale",                      domain:"K", subDomain:"21", relatedCodes:["J1101","K2102"], keywords:["médecin","consultation","généraliste","patient","cabinet"] },
  { code:"K2102", label:"Enseignement de l'alphabétisation",                     domain:"K", subDomain:"21", relatedCodes:["K1203","K1204"], keywords:["formateur","alphabétisation","illettrisme","FLE","adultes"] },
  { code:"K2103", label:"Enseignement artistique",                                domain:"K", subDomain:"21", relatedCodes:["K1203","L1503"], keywords:["professeur","art","danse","musique","conservatoire"] },
  { code:"K2104", label:"Services domestiques",                                   domain:"K", subDomain:"21", relatedCodes:["K1302","I1201"], keywords:["femme de ménage","auxiliaire","domicile","ménage","entretien"] },
  { code:"K2201", label:"Blanchisserie et pressing",                              domain:"K", subDomain:"22", relatedCodes:["K2204","I1201"], keywords:["blanchisseur","pressing","nettoyage","linge","teinturerie"] },
  { code:"K2202", label:"Lavage - nettoyage de véhicules",                        domain:"K", subDomain:"22", relatedCodes:["K2201","I1201"], keywords:["laveur","auto","véhicule","station","nettoyage"] },
  { code:"K2203", label:"Funéraire",                                              domain:"K", subDomain:"22", relatedCodes:["K2204","K2201"], keywords:["pompes funèbres","thanatopracteur","obsèques","funéraire","crémation"] },
  { code:"K2204", label:"Nettoyage de locaux",                                    domain:"K", subDomain:"22", relatedCodes:["I1201","I1202"], keywords:["agent de nettoyage","propreté","locaux","entreprise","hygiène"] },
  { code:"K2301", label:"Distribution de documents",                              domain:"K", subDomain:"23", relatedCodes:["K2302","N1101"], keywords:["facteur","distributeur","courrier","prospectus","livraison"] },
  { code:"K2302", label:"Mise en rayon libre-service",                            domain:"K", subDomain:"23", relatedCodes:["D1107","K2301"], keywords:["employé libre service","mise en rayon","supermarché","stock","réassort"] },
  { code:"K2303", label:"Vente au détail de fruits et légumes",                   domain:"K", subDomain:"23", relatedCodes:["D1107","A1401"], keywords:["vendeur","marché","primeur","fruits","légumes"] },
  { code:"K2401", label:"Criminologie",                                           domain:"K", subDomain:"24", relatedCodes:["K2402","M1403"], keywords:["criminologue","expertise","judiciaire","analyse","crime"] },
  { code:"K2402", label:"Droit",                                                  domain:"K", subDomain:"24", relatedCodes:["K2401","M1401"], keywords:["avocat","juriste","droit","contentieux","conseil juridique"] },
  { code:"K2501", label:"Gardiennage de locaux",                                  domain:"K", subDomain:"25", relatedCodes:["K2502","K2503"], keywords:["gardien","vigile","surveillance","sécurité","agent"] },
  { code:"K2502", label:"Sécurité et surveillance privées",                       domain:"K", subDomain:"25", relatedCodes:["K2501","K2503"], keywords:["agent de sécurité","CQP","surveillance","gardiennage","APS"] },
  { code:"K2503", label:"Sécurité incendie et secours",                           domain:"K", subDomain:"25", relatedCodes:["K2502","K2501"], keywords:["SSIAP","pompier","incendie","secours","sécurité"] },
  { code:"K2601", label:"Gestion forestière et environnementale",                 domain:"K", subDomain:"26", relatedCodes:["A1202","A1205"], keywords:["garde forestier","forêt","ONF","environnement","sylviculteur"] },
  { code:"K2602", label:"Protection des milieux naturels",                        domain:"K", subDomain:"26", relatedCodes:["K2601","A1204"], keywords:["garde de la nature","parc national","protection","faune","flore"] },

  // ── L — Spectacle ────────────────────────────────────────────────────────
  { code:"L1101", label:"Danse",                                                  domain:"L", subDomain:"11", relatedCodes:["L1102","L1103"], keywords:["danseur","chorégraphe","ballet","danse","compagnie"] },
  { code:"L1102", label:"Musique et chant",                                       domain:"L", subDomain:"11", relatedCodes:["L1101","L1103"], keywords:["musicien","chanteur","compositeur","orchestre","concert"] },
  { code:"L1103", label:"Théâtre",                                                domain:"L", subDomain:"11", relatedCodes:["L1101","L1104"], keywords:["acteur","comédien","metteur en scène","théâtre","troupe"] },
  { code:"L1104", label:"Arts du cirque",                                         domain:"L", subDomain:"11", relatedCodes:["L1103","L1101"], keywords:["artiste","cirque","acrobate","jongleur","spectacle"] },
  { code:"L1105", label:"Arts de la rue",                                         domain:"L", subDomain:"11", relatedCodes:["L1104","L1103"], keywords:["artiste de rue","spectacle","busking","animation","performances"] },
  { code:"L1201", label:"Costumier et habilleur",                                 domain:"L", subDomain:"12", relatedCodes:["L1202","L1101"], keywords:["costumier","habilleur","costume","spectacle","théâtre"] },
  { code:"L1202", label:"Coiffure et maquillage spectacle",                       domain:"L", subDomain:"12", relatedCodes:["L1201","D1202"], keywords:["coiffeur","maquilleur","spectacle","plateau","cinéma"] },
  { code:"L1203", label:"Décor et accessoires spectacle",                         domain:"L", subDomain:"12", relatedCodes:["L1201","L1301"], keywords:["décorateur","accessoiriste","plateau","théâtre","scénographe"] },
  { code:"L1301", label:"Régie générale",                                         domain:"L", subDomain:"13", relatedCodes:["L1302","L1303"], keywords:["régisseur","spectacle","technique","plateau","production"] },
  { code:"L1302", label:"Éclairagiste et technicien lumière spectacle",           domain:"L", subDomain:"13", relatedCodes:["L1301","L1303"], keywords:["éclairagiste","lumière","spectacle","live","technicien"] },
  { code:"L1303", label:"Son et lumière spectacle",                               domain:"L", subDomain:"13", relatedCodes:["L1302","E1305"], keywords:["technicien son","spectacle","live","scène","ingénieur son"] },
  { code:"L1401", label:"Mise en scène et décor spectacle",                       domain:"L", subDomain:"14", relatedCodes:["L1301","L1203"], keywords:["metteur en scène","réalisateur","décorateur","scénographe","spectacle"] },
  { code:"L1501", label:"Programmation de spectacles",                            domain:"L", subDomain:"15", relatedCodes:["L1502","L1503"], keywords:["programmateur","spectacles","festival","tournée","producteur"] },
  { code:"L1502", label:"Production de spectacles",                               domain:"L", subDomain:"15", relatedCodes:["L1501","L1503"], keywords:["producteur","spectacle","tournée","management","artiste"] },
  { code:"L1503", label:"Promotion d'artistes et de spectacles",                  domain:"L", subDomain:"15", relatedCodes:["L1501","L1502"], keywords:["manager","artiste","agent","promotion","booking"] },

  // ── M — Support à l'entreprise ───────────────────────────────────────────
  { code:"M1101", label:"Achats",                                                  domain:"M", subDomain:"11", relatedCodes:["M1102","N1303"], keywords:["acheteur","approvisionnement","procurement","fournisseurs","négociation"] },
  { code:"M1102", label:"Direction des achats",                                   domain:"M", subDomain:"11", relatedCodes:["M1101","M1603"], keywords:["directeur achats","procurement","supply chain","manager","stratégie"] },
  { code:"M1201", label:"Analyse et traitement de l'information",                 domain:"M", subDomain:"12", relatedCodes:["M1202","M1203"], keywords:["data analyst","analyste","données","reporting","BI"] },
  { code:"M1202", label:"Audit et contrôle comptables et financiers",             domain:"M", subDomain:"12", relatedCodes:["M1201","M1203"], keywords:["auditeur","comptable","financier","contrôle","CAC"] },
  { code:"M1203", label:"Comptabilité",                                           domain:"M", subDomain:"12", relatedCodes:["M1202","M1204"], keywords:["comptable","comptabilité","bilan","liasse","TVA"] },
  { code:"M1204", label:"Contrôle de gestion",                                    domain:"M", subDomain:"12", relatedCodes:["M1203","M1205"], keywords:["contrôleur de gestion","budget","reporting","forecast","analyse"] },
  { code:"M1205", label:"Direction administrative et financière",                 domain:"M", subDomain:"12", relatedCodes:["M1204","M1603"], keywords:["DAF","directeur financier","finance","direction","CFO"] },
  { code:"M1206", label:"Management de groupe ou de service comptable",           domain:"M", subDomain:"12", relatedCodes:["M1203","M1205"], keywords:["chef comptable","responsable","management","comptabilité","équipe"] },
  { code:"M1301", label:"Direction de grande entreprise ou d'établissement public", domain:"M", subDomain:"13", relatedCodes:["M1302","M1603"], keywords:["PDG","directeur général","DG","CEO","dirigeant"] },
  { code:"M1302", label:"Direction de petite ou moyenne entreprise",              domain:"M", subDomain:"13", relatedCodes:["M1301","M1603"], keywords:["dirigeant","PDG","PME","entrepreneur","gérant"] },
  { code:"M1401", label:"Conduite d'opérations juridiques",                       domain:"M", subDomain:"14", relatedCodes:["M1402","K2402"], keywords:["juriste","contentieux","contrats","droit","juridique"] },
  { code:"M1402", label:"Développement et promotion du numérique",                domain:"M", subDomain:"14", relatedCodes:["M1801","M1805"], keywords:["chef de projet digital","transformation","numérique","IT","web"] },
  { code:"M1403", label:"Études juridiques",                                      domain:"M", subDomain:"14", relatedCodes:["M1401","K2402"], keywords:["juriste","études","droit","conformité","réglementation"] },
  { code:"M1404", label:"Notariat",                                               domain:"M", subDomain:"14", relatedCodes:["M1401","M1403"], keywords:["notaire","clerc","acte","immobilier","succession"] },
  { code:"M1501", label:"Conseil en emploi et insertion professionnelle",         domain:"M", subDomain:"15", relatedCodes:["K1205","M1502"], keywords:["conseiller","emploi","orientation","bilan de compétences","RH"] },
  { code:"M1502", label:"Développement des ressources humaines",                  domain:"M", subDomain:"15", relatedCodes:["M1501","M1503"], keywords:["RH","formation","développement","GPEC","talent"] },
  { code:"M1503", label:"Management des ressources humaines",                     domain:"M", subDomain:"15", relatedCodes:["M1502","K1402"], keywords:["DRH","RH","gestion","recrutement","paie","management"] },
  { code:"M1504", label:"Recrutement",                                            domain:"M", subDomain:"15", relatedCodes:["M1503","M1502"], keywords:["recruteur","chasseur de têtes","talent acquisition","RH","sourcing"] },
  { code:"M1505", label:"Stratégie et développement RH",                          domain:"M", subDomain:"15", relatedCodes:["M1503","M1502"], keywords:["DRH","stratégie","transformation","culture","organisation"] },
  { code:"M1601", label:"Accueil et renseignements",                              domain:"M", subDomain:"16", relatedCodes:["M1602","M1603"], keywords:["hôtesse","accueil","standardiste","réceptionniste","secrétaire"] },
  { code:"M1602", label:"Opérations administratives",                             domain:"M", subDomain:"16", relatedCodes:["M1601","M1603"], keywords:["assistant administratif","secrétaire","administratif","saisie","gestion"] },
  { code:"M1603", label:"Management de dirigeants d'entreprise",                  domain:"M", subDomain:"16", relatedCodes:["M1301","M1604"], keywords:["assistant de direction","EA","secrétaire de direction","dirigeant"] },
  { code:"M1604", label:"Secrétariat",                                            domain:"M", subDomain:"16", relatedCodes:["M1602","M1603"], keywords:["secrétaire","assistant","administratif","courrier","agenda"] },
  { code:"M1605", label:"Assistanat de direction",                                domain:"M", subDomain:"16", relatedCodes:["M1603","M1604"], keywords:["assistant de direction","EA","office manager","organisation","agenda"] },
  { code:"M1606", label:"Secrétariat comptable",                                  domain:"M", subDomain:"16", relatedCodes:["M1203","M1604"], keywords:["secrétaire comptable","facturation","saisie","comptabilité","assistant"] },
  { code:"M1607", label:"Secrétariat médical et médico-social",                   domain:"M", subDomain:"16", relatedCodes:["M1604","J1303"], keywords:["secrétaire médicale","cabinet","hôpital","rendez-vous","administrative"] },
  { code:"M1701", label:"Administration des ventes",                              domain:"M", subDomain:"17", relatedCodes:["M1702","D1406"], keywords:["ADV","administration des ventes","commandes","SAV","commercial"] },
  { code:"M1702", label:"Analyse de tendances",                                   domain:"M", subDomain:"17", relatedCodes:["M1701","M1703"], keywords:["market research","études de marché","analyste","tendances","insights"] },
  { code:"M1703", label:"Management et gestion de produit",                       domain:"M", subDomain:"17", relatedCodes:["M1702","M1704"], keywords:["product manager","chef de produit","roadmap","backlog","agile"] },
  { code:"M1704", label:"Marketing",                                              domain:"M", subDomain:"17", relatedCodes:["M1703","M1705"], keywords:["marketing","chargé","campagne","stratégie","brand"] },
  { code:"M1705", label:"Stratégie marketing et communication",                   domain:"M", subDomain:"17", relatedCodes:["M1704","E1103"], keywords:["directeur marketing","stratégie","communication","marque","CMO"] },
  { code:"M1706", label:"Promotion des ventes",                                   domain:"M", subDomain:"17", relatedCodes:["M1704","D1406"], keywords:["merchandising","trade marketing","promotions","vente","PLV"] },
  { code:"M1801", label:"Administration de systèmes d'information",               domain:"M", subDomain:"18", relatedCodes:["M1802","M1805"], keywords:["sysadmin","administrateur","infrastructure","réseau","système"] },
  { code:"M1802", label:"Expertise et support en systèmes d'information",         domain:"M", subDomain:"18", relatedCodes:["M1801","M1805"], keywords:["support","helpdesk","technicien","systèmes","N1","N2"] },
  { code:"M1803", label:"Direction des systèmes d'information",                   domain:"M", subDomain:"18", relatedCodes:["M1805","M1806"], keywords:["DSI","directeur IT","CTO","SI","stratégie","transformation"] },
  { code:"M1804", label:"Études et développement de réseaux",                     domain:"M", subDomain:"18", relatedCodes:["M1801","M1805"], keywords:["réseau","télécoms","infrastructure","ingénieur","CCNA"] },
  { code:"M1805", label:"Études et développement informatique",                   domain:"M", subDomain:"18", relatedCodes:["M1806","M1810","M1801"], keywords:["développeur","dev","software","fullstack","backend","frontend","react","node","python","java","TypeScript"] },
  { code:"M1806", label:"Conseil et maîtrise d'ouvrage SI",                       domain:"M", subDomain:"18", relatedCodes:["M1803","M1805"], keywords:["consultant","MOA","MOE","chef de projet","product owner","business analyst"] },
  { code:"M1807", label:"Exploitation de systèmes de communication",              domain:"M", subDomain:"18", relatedCodes:["M1801","M1804"], keywords:["exploitation","opérateur","monitoring","NOC","systèmes"] },
  { code:"M1808", label:"Information géographique",                               domain:"M", subDomain:"18", relatedCodes:["M1805","F1107"], keywords:["SIG","géomatique","cartographie","GIS","spatial"] },
  { code:"M1809", label:"Sécurité de l'information",                              domain:"M", subDomain:"18", relatedCodes:["M1801","M1805"], keywords:["RSSI","cybersécurité","sécurité","SOC","pentesting","CISO"] },
  { code:"M1810", label:"Production et exploitation de systèmes d'information",  domain:"M", subDomain:"18", relatedCodes:["M1801","M1807"], keywords:["DevOps","cloud","infrastructure","production","SRE","AWS","Azure"] },

  // ── N — Transport et Logistique ──────────────────────────────────────────
  { code:"N1101", label:"Conduite de transport de marchandises sur longue distance", domain:"N", subDomain:"11", relatedCodes:["N1102","N1103"], keywords:["chauffeur","routier","camion","transport","marchandises","SPL"] },
  { code:"N1102", label:"Conduite de transport en commun sur route",              domain:"N", subDomain:"11", relatedCodes:["N1101","N1103"], keywords:["chauffeur","bus","car","transport en commun","voyageurs"] },
  { code:"N1103", label:"Conduite de transport de particuliers",                  domain:"N", subDomain:"11", relatedCodes:["N1102","N1104"], keywords:["taxi","VTC","chauffeur","Uber","ambulancier"] },
  { code:"N1104", label:"Courses et livraisons express",                          domain:"N", subDomain:"11", relatedCodes:["N1103","N1105"], keywords:["livreur","coursier","express","vélo","livraison"] },
  { code:"N1105", label:"Conduite et manœuvre d'engins de chantier",             domain:"N", subDomain:"11", relatedCodes:["F1705","N1106"], keywords:["conducteur d'engins","pelleteuse","grue","chantier","CACES"] },
  { code:"N1106", label:"Conduite d'engins de manutention",                       domain:"N", subDomain:"11", relatedCodes:["N1105","N1301"], keywords:["cariste","CACES","chariot","manutention","entrepôt"] },
  { code:"N1201", label:"Affrètement transport",                                  domain:"N", subDomain:"12", relatedCodes:["N1202","N1203"], keywords:["affréteur","transport","logistique","fret","commissionnaire"] },
  { code:"N1202", label:"Gestion des opérations de circulation internationale de marchandises", domain:"N", subDomain:"12", relatedCodes:["N1201","N1203"], keywords:["transit","douane","import","export","international"] },
  { code:"N1203", label:"Direction d'exploitation logistique",                    domain:"N", subDomain:"12", relatedCodes:["N1201","N1301"], keywords:["directeur","logistique","exploitation","entrepôt","supply chain"] },
  { code:"N1204", label:"Conception et organisation de la chaîne logistique",     domain:"N", subDomain:"12", relatedCodes:["N1203","N1301"], keywords:["supply chain","logistique","organisation","flux","optimisation"] },
  { code:"N1205", label:"Transport aérien",                                       domain:"N", subDomain:"12", relatedCodes:["N1206","N1201"], keywords:["fret aérien","aéroport","handling","cargo","aviation"] },
  { code:"N1206", label:"Transport ferroviaire",                                  domain:"N", subDomain:"12", relatedCodes:["N1205","N2101"], keywords:["SNCF","ferroviaire","rail","conducteur","train"] },
  { code:"N1207", label:"Transport fluvial et maritime",                          domain:"N", subDomain:"12", relatedCodes:["N1205","A3201"], keywords:["maritime","fluvial","bateau","port","navigation"] },
  { code:"N1301", label:"Magasinage et préparation de commandes",                 domain:"N", subDomain:"13", relatedCodes:["N1302","N1303"], keywords:["préparateur","commandes","entrepôt","logistique","picking"] },
  { code:"N1302", label:"Réception et expédition marchandises",                   domain:"N", subDomain:"13", relatedCodes:["N1301","N1303"], keywords:["réceptionnaire","expédition","entrepôt","marchandises","contrôle"] },
  { code:"N1303", label:"Supervision d'approvisionnement",                        domain:"N", subDomain:"13", relatedCodes:["N1302","M1101"], keywords:["approvisionneur","stock","gestion","ERP","supply"] },
  { code:"N2101", label:"Navigation commerciale aérienne",                        domain:"N", subDomain:"21", relatedCodes:["N2102","N1205"], keywords:["pilote","aviation","commandant","co-pilote","compagnie"] },
  { code:"N2102", label:"Conduite de train et métro",                             domain:"N", subDomain:"21", relatedCodes:["N2101","N1206"], keywords:["conducteur","train","SNCF","métro","RER"] },
  { code:"N2103", label:"Personnel naviguant technique de l'aviation",            domain:"N", subDomain:"21", relatedCodes:["N2101","N2104"], keywords:["mécanicien navigant","aviation","avion","maintenance","vol"] },
  { code:"N2104", label:"Hôtesses de l'air et stewards",                          domain:"N", subDomain:"21", relatedCodes:["N2101","N2103"], keywords:["hôtesse de l'air","steward","PNC","cabine","aviation"] },
  { code:"N3101", label:"Conduite d'engins de terrassement et carrières",         domain:"N", subDomain:"31", relatedCodes:["F1705","N1105"], keywords:["conducteur","engins","BTP","carrière","terrassement"] },
  { code:"N4101", label:"Mise en place et vérification des systèmes de navigation", domain:"N", subDomain:"41", relatedCodes:["N4102","N2101"], keywords:["navigation","systèmes","vérification","maritime","aérien"] },
  { code:"N4102", label:"Conduite de véhicule de transport collectif urbain",     domain:"N", subDomain:"41", relatedCodes:["N1102","N4101"], keywords:["chauffeur","bus","tramway","urbain","transport en commun"] },
];

const INDEX = new Map<string, RomeNode>(
  ROME_NODES.map(node => [node.code, node])
);

/**
 * Compute proximity between a job's ROME code and the user's ROME codes.
 * Returns the best proximity found across all user codes.
 */
export function computeRomeProximity(
  jobCode: string,
  userCodes: string[]
): RomeProximity {
  const job = INDEX.get(jobCode.toUpperCase());
  if (!job) return "NONE";

  let best: RomeProximity = "NONE";

  for (const uc of userCodes) {
    const user = INDEX.get(uc.toUpperCase());
    if (!user) continue;

    const proximity = getProximity(job, user);
    if (proximityRank(proximity) > proximityRank(best)) {
      best = proximity;
    }
    if (best === "EXACT") break; // can't do better
  }

  return best;
}

function getProximity(a: RomeNode, b: RomeNode): RomeProximity {
  if (a.code === b.code)            return "EXACT";
  if (a.subDomain === b.subDomain)  return "SAME_DOMAIN";
  if (a.relatedCodes.includes(b.code) || b.relatedCodes.includes(a.code)) return "ADJACENT";
  if (a.domain === b.domain)        return "ADJACENT";
  return "NONE";
}

const PROXIMITY_RANK: Record<RomeProximity, number> = {
  EXACT: 3, SAME_DOMAIN: 2, ADJACENT: 1, NONE: 0,
};
function proximityRank(p: RomeProximity): number {
  return PROXIMITY_RANK[p];
}

/**
 * Convert proximity to a 0–100 score.
 */
export function proximityToScore(proximity: RomeProximity): number {
  switch (proximity) {
    case "EXACT":       return 100;
    case "SAME_DOMAIN": return 65;
    case "ADJACENT":    return 30;
    case "NONE":        return 0;
  }
}

/**
 * Expand a list of ROME codes to include adjacent/related codes.
 * Useful for broadening a user's search automatically.
 */
export function expandRomeCodes(codes: string[]): string[] {
  const expanded = new Set(codes.map(c => c.toUpperCase()));
  for (const code of codes) {
    const node = INDEX.get(code.toUpperCase());
    if (node) {
      node.relatedCodes.forEach(rc => expanded.add(rc));
    }
  }
  return [...expanded];
}

export { ROME_NODES, INDEX };

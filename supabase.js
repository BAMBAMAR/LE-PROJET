// ==========================================
// SUPABASE.JS - Configuration client Supabase
// ==========================================

class SupabaseService {
    constructor() {
        this.supabaseUrl = 'https://votre-projet.supabase.co'; // Remplacez par votre URL
        this.supabaseKey = 'votre-clé-anon'; // Remplacez par votre clé anonyme
        
        // Initialisation du client
        this.client = null;
        this.init();
    }
    
    init() {
        if (!this.supabaseUrl || !this.supabaseKey) {
            console.warn('⚠️ Supabase non configuré - mode démo activé');
            this.isDemoMode = true;
            return;
        }
        
        try {
            this.client = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
            console.log('✅ Supabase client initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation Supabase:', error);
            this.isDemoMode = true;
        }
    }
    
    // Charger les promesses
    async loadPromises() {
        if (this.isDemoMode) return this.loadDemoData();
        
        try {
            const { data, error } = await this.client
                .from('promises')
                .select('*')
                .order('id', { ascending: true });
            
            if (error) throw error;
            
            // Charger les notations et partages pour chaque promesse
            const promisesWithRatings = await Promise.all(
                data.map(async (promise) => {
                    const ratings = await this.getPromiseRatings(promise.id);
                    const shares = await this.getPromiseShares(promise.id);
                    
                    return {
                        ...promise,
                        average_rating: ratings.average || 0,
                        rating_count: ratings.count || 0,
                        share_count: shares || 0,
                        user_rating: null // Sera rempli si l'utilisateur a noté
                    };
                })
            );
            
            return promisesWithRatings;
        } catch (error) {
            console.error('❌ Erreur chargement promesses:', error);
            return this.loadDemoData();
        }
    }
    
    // Charger les actualités
    async loadNews() {
        if (this.isDemoMode) return this.loadDemoNews();
        
        try {
            const { data, error } = await this.client
                .from('news')
                .select('*')
                .order('date', { ascending: false })
                .limit(10);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Erreur chargement actualités:', error);
            return this.loadDemoNews();
        }
    }
    
    // Noter une promesse
    async ratePromise(promiseId, rating, comment = '') {
        if (this.isDemoMode) {
            console.log('💡 Mode démo - Notation simulée:', { promiseId, rating, comment });
            return { success: true, average: 4.2, count: 15 };
        }
        
        try {
            // Générer un ID utilisateur anonyme
            const userId = this.getAnonymousUserId();
            
            // Insérer/Remplacer la notation
            const { error: upsertError } = await this.client
                .from('ratings')
                .upsert({
                    promise_id: promiseId,
                    user_id: userId,
                    rating: rating,
                    comment: comment,
                    created_at: new Date().toISOString()
                }, { onConflict: 'promise_id,user_id' });
            
            if (upsertError) throw upsertError;
            
            // Calculer la nouvelle moyenne
            const { data: ratings, error: calcError } = await this.client
                .from('ratings')
                .select('rating')
                .eq('promise_id', promiseId);
            
            if (calcError) throw calcError;
            
            const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
            
            return {
                success: true,
                average: parseFloat(average.toFixed(1)),
                count: ratings.length
            };
        } catch (error) {
            console.error('❌ Erreur notation:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Partager une promesse
    async sharePromise(promiseId, platform) {
        if (this.isDemoMode) {
            console.log('💡 Mode démo - Partage simulé:', { promiseId, platform });
            return { success: true, count: Math.floor(Math.random() * 50) + 10 };
        }
        
        try {
            // Incrémenter le compteur de partages
            const { data, error } = await this.client.rpc('increment_share_count', {
                p_promise_id: promiseId,
                p_platform: platform
            });
            
            if (error) throw error;
            
            return { success: true, count: data?.new_count || 0 };
        } catch (error) {
            console.error('❌ Erreur partage:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Obtenir les notations d'une promesse
    async getPromiseRatings(promiseId) {
        if (this.isDemoMode) {
            return { average: 4.2, count: 15 };
        }
        
        try {
            const { data, error } = await this.client
                .from('ratings')
                .select('rating')
                .eq('promise_id', promiseId);
            
            if (error) throw error;
            
            if (data.length === 0) return { average: 0, count: 0 };
            
            const average = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
            
            return {
                average: parseFloat(average.toFixed(1)),
                count: data.length
            };
        } catch (error) {
            console.error('❌ Erreur récupération notations:', error);
            return { average: 0, count: 0 };
        }
    }
    
    // Obtenir le nombre de partages
    async getPromiseShares(promiseId) {
        if (this.isDemoMode) {
            return Math.floor(Math.random() * 50) + 10;
        }
        
        try {
            const { data, error } = await this.client
                .from('promises')
                .select('share_count')
                .eq('id', promiseId)
                .single();
            
            if (error) throw error;
            return data.share_count || 0;
        } catch (error) {
            console.error('❌ Erreur récupération partages:', error);
            return 0;
        }
    }
    
    // ID utilisateur anonyme (persistant via localStorage)
    getAnonymousUserId() {
        let userId = localStorage.getItem('supabase_anon_user_id');
        if (!userId) {
            userId = 'anon_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('supabase_anon_user_id', userId);
        }
        return userId;
    }
    
    // Données de démo (mode hors ligne)
    loadDemoData() {
        return [
            {
                id: 1,
                domaine: 'Éducation',
                engagement: 'Gratuité totale des frais scolaires dans le public',
                resultat: 'Tous les élèves du public dispensés de payer les frais scolaires',
                delai: 'Immédiat',
                status: 'realise',
                mises_a_jour: [
                    { date: '2024-04-15', texte: 'Décret présidentiel signé', source: 'Journal Officiel' },
                    { date: '2024-05-02', texte: 'Mise en œuvre effective dans toutes les écoles', source: 'Ministère de l\'Éducation' }
                ],
                average_rating: 4.7,
                rating_count: 243,
                share_count: 1892
            },
            {
                id: 2,
                domaine: 'Santé',
                engagement: 'Gratuité des soins pour les moins de 5 ans et les personnes âgées de plus de 65 ans',
                resultat: 'Accès gratuit aux soins pour les populations vulnérables',
                delai: '3 mois',
                status: 'encours',
                mises_a_jour: [
                    { date: '2024-05-10', texte: 'Décret en cours de finalisation', source: 'Ministère de la Santé' }
                ],
                average_rating: 4.5,
                rating_count: 187,
                share_count: 1456
            },
            {
                id: 3,
                domaine: 'Économie',
                engagement: 'Suppression de la TVA sur les produits de première nécessité',
                resultat: 'Baisse du coût de la vie pour les ménages',
                delai: '6 mois',
                status: 'non-lance',
                mises_a_jour: [],
                average_rating: 4.8,
                rating_count: 312,
                share_count: 2145
            }
        ];
    }
    
    loadDemoNews() {
        return [
            {
                id: 1,
                date: '27 Jan',
                title: 'Lancement du programme d\'autonomisation des femmes',
                excerpt: 'Le gouvernement annonce le lancement officiel du programme national pour l\'autonomisation économique des femmes...',
                source: 'APS',
                type: 'latest',
                url: '#'
            },
            {
                id: 2,
                date: '25 Jan',
                title: 'Réforme du système éducatif en cours',
                excerpt: 'Les premières mesures de la réforme éducative sont en phase de mise en œuvre dans plusieurs régions...',
                source: 'Le Quotidien',
                type: 'latest',
                url: '#'
            },
            {
                id: 3,
                date: '22 Jan',
                title: 'Investissements dans les infrastructures routières',
                excerpt: 'Nouvelles annonces concernant les investissements massifs dans la modernisation du réseau routier national...',
                source: 'Sud Quotidien',
                type: 'press',
                url: '#'
            }
        ];
    }
}

// Initialisation globale
const supabaseService = new SupabaseService();
window.supabaseService = supabaseService;

console.log('🔌 Service Supabase prêt');
/**
 * Models Service
 * Manages available AI models, pricing tiers, and selection logic
 */
const ModelsService = {
    // All available models with metadata
    MODELS: [
        // Free tier
        { id: 'deepseek/deepseek-chat-v3-0324', name: 'DeepSeek V3', tier: 'free', provider: 'DeepSeek', context: 64000, description: '最新强大模型，支持超长上下文' },
        { id: 'meta-llama/llama-4-maverick', name: 'Llama 4', tier: 'free', provider: 'Meta', context: 32000, description: 'Meta开源旗舰模型' },
        { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash', tier: 'free', provider: 'Google', context: 1000000, description: '极速响应，支持百万token上下文' },
        { id: 'qwen/qwen3-32b', name: 'Qwen3 32B', tier: 'free', provider: 'Alibaba', context: 32000, description: '阿里开源强推理模型' },
        
        // Pro tier
        { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', tier: 'pro', provider: 'Anthropic', context: 200000, description: '平衡性能与成本的旗舰模型' },
        { id: 'openai/gpt-4o', name: 'GPT-4o', tier: 'pro', provider: 'OpenAI', context: 128000, description: 'OpenAI全能旗舰模型' },
        { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', tier: 'pro', provider: 'Google', context: 2000000, description: '超长上下文能力' },
        
        // Premium tier
        { id: 'anthropic/claude-3-haiku', name: 'Claude Haiku', tier: 'premium', provider: 'Anthropic', context: 200000, description: '轻量快速，性价比极高' },
        { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', tier: 'premium', provider: 'OpenAI', context: 128000, description: '轻量版GPT-4o' },
        { id: 'x-ai/grok-4', name: 'Grok 4', tier: 'premium', provider: 'xAI', context: 128000, description: 'xAI最新旗舰，幽默博学' },
        { id: 'x-ai/grok-3', name: 'Grok 3', tier: 'premium', provider: 'xAI', context: 128000, description: 'Grok系列经典之作' },
        { id: 'mistralai/mistral-large', name: 'Mistral Large', tier: 'premium', provider: 'Mistral', context: 32000, description: '欧洲最强开源模型' },
    ],
    
    DEFAULT_MODEL: 'deepseek/deepseek-chat-v3-0324',
    USER_PREFERENCES_KEY: 'alpha_model_preferences',
    
    /**
     * Get model by ID
     */
    getById(id) {
        return this.MODELS.find(m => m.id === id) || this.MODELS[0];
    },
    
    /**
     * Get all models
     */
    getAll() {
        return this.MODELS;
    },
    
    /**
     * Get models by tier
     */
    getByTier(tier) {
        return this.MODELS.filter(m => m.tier === tier);
    },
    
    /**
     * Get free tier models
     */
    getFreeModels() {
        return this.MODELS.filter(m => m.tier === 'free');
    },
    
    /**
     * Get pro tier models
     */
    getProModels() {
        return this.MODELS.filter(m => m.tier === 'pro');
    },
    
    /**
     * Get premium tier models
     */
    getPremiumModels() {
        return this.MODELS.filter(m => m.tier === 'premium');
    },
    
    /**
     * Check if user has access to a model based on their plan
     */
    hasAccess(modelId, userPlan) {
        const model = this.getById(modelId);
        if (!model) return false;
        const accessMap = {
            'free': ['free'],
            'pro': ['free', 'pro'],
            'premium': ['free', 'pro', 'premium'],
        };
        return (accessMap[userPlan] || ['free']).includes(model.tier);
    },
    
    /**
     * Get the best available model for a user
     */
    getBestForUser(userPlan) {
        const accessMap = {
            'free': 'free',
            'pro': 'pro',
            'premium': 'premium',
        };
        const tier = accessMap[userPlan] || 'free';
        const models = this.MODELS.filter(m => m.tier === tier);
        return models[0] || this.MODELS[0];
    },
    
    /**
     * Render model select options
     */
    renderSelectOptions(userPlan, selectedId) {
        const tiers = [
            { key: 'free', label: '🆓 免费模型' },
            { key: 'pro', label: '⭐ Pro模型' },
            { key: 'premium', label: '👑 Premium模型' },
        ];
        let html = '';
        for (const tier of tiers) {
            const models = this.getByTier(tier.key);
            const hasAccess = this.hasAccess(models[0]?.id, userPlan);
            html += `<optgroup label="${tier.label}${!hasAccess ? ' (升级解锁)' : ''}">`;
            for (const model of models) {
                const disabled = !this.hasAccess(model.id, userPlan) ? 'disabled' : '';
                const selected = model.id === selectedId ? 'selected' : '';
                html += `<option value="${model.id}" ${selected} ${disabled}>${model.name}</option>`;
            }
            html += `</optgroup>`;
        }
        return html;
    },
    
    /**
     * Get model display info
     */
    getDisplayInfo(id) {
        const model = this.getById(id);
        if (!model) return null;
        const tierLabels = { free: '免费', pro: 'Pro', premium: 'Premium' };
        const tierColors = { free: 'var(--accent)', pro: '#8b5cf6', premium: '#f59e0b' };
        return {
            ...model,
            tierLabel: tierLabels[model.tier] || model.tier,
            tierColor: tierColors[model.tier] || 'var(--text-secondary)',
        };
    },
    
    /**
     * Save user preferences
     */
    savePreferences(prefs) {
        try {
            localStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(prefs));
        } catch (e) {
            console.error('[Models] Save prefs failed:', e);
        }
    },
    
    /**
     * Load user preferences
     */
    loadPreferences() {
        try {
            const data = localStorage.getItem(this.USER_PREFERENCES_KEY);
            return data ? JSON.parse(data) : { lastModel: this.DEFAULT_MODEL };
        } catch (e) {
            return { lastModel: this.DEFAULT_MODEL };
        }
    },
};

// Export for use
window.ModelsService = ModelsService;

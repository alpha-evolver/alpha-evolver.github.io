/**
 * Conversations Service
 * Handles chat history persistence using localStorage
 */
const ConversationsService = {
    STORAGE_KEY: 'alpha_conversations',
    MAX_CONVERSATIONS: 100,
    
    /**
     * Load all conversations from localStorage
     */
    loadAll() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('[Conversations] Load failed:', e);
            return [];
        }
    },
    
    /**
     * Save all conversations to localStorage
     */
    saveAll(conversations) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversations));
        } catch (e) {
            console.error('[Conversations] Save failed:', e);
        }
    },
    
    /**
     * Create a new conversation
     */
    create(conversations) {
        const conv = {
            id: 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: '新对话',
            messages: [],
            model: 'deepseek/deepseek-chat-v3-0324',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        conversations.unshift(conv);
        this.trim(conversations);
        return conv;
    },
    
    /**
     * Update an existing conversation
     */
    update(conversations, id, updates) {
        const idx = conversations.findIndex(c => c.id === id);
        if (idx === -1) return null;
        conversations[idx] = { ...conversations[idx], ...updates, updatedAt: Date.now() };
        // Move to top
        const [conv] = conversations.splice(idx, 1);
        conversations.unshift(conv);
        return conversations[idx];
    },
    
    /**
     * Delete a conversation by ID
     */
    delete(conversations, id) {
        const idx = conversations.findIndex(c => c.id === id);
        if (idx !== -1) conversations.splice(idx, 1);
    },
    
    /**
     * Add a message to a conversation
     */
    addMessage(conversations, convId, message) {
        const conv = conversations.find(c => c.id === convId);
        if (!conv) return null;
        conv.messages.push(message);
        conv.updatedAt = Date.now();
        // Auto-title from first user message
        if (conv.messages.length === 1 && message.role === 'user') {
            conv.title = message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '');
        }
        // Move to top
        const idx = conversations.findIndex(c => c.id === convId);
        const [item] = conversations.splice(idx, 1);
        conversations.unshift(item);
        return conv;
    },
    
    /**
     * Generate title for a conversation from first user message
     */
    generateTitle(userMessage) {
        return userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '');
    },
    
    /**
     * Trim conversations to max limit
     */
    trim(conversations) {
        if (conversations.length > this.MAX_CONVERSATIONS) {
            conversations.splice(this.MAX_CONVERSATIONS);
        }
    },
    
    /**
     * Export conversation as JSON
     */
    export(conv) {
        const blob = new Blob([JSON.stringify(conv, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation_${conv.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    /**
     * Import conversation from JSON
     */
    import(conversations, jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (!imported.id || !Array.isArray(imported.messages)) {
                throw new Error('Invalid format');
            }
            imported.id = 'conv_' + Date.now() + '_import';
            imported.createdAt = Date.now();
            imported.updatedAt = Date.now();
            conversations.unshift(imported);
            return imported;
        } catch (e) {
            console.error('[Conversations] Import failed:', e);
            return null;
        }
    },
};

// Export for use
window.ConversationsService = ConversationsService;

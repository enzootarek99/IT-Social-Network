'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type AuthUser } from '@/contexts';
import { formatDate } from '@/lib/utils';

type Message = {
  id: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: AuthUser;
  senderId: string;
};

type ConversationSummary = {
  id: string;
  otherParticipant: AuthUser;
  lastMessage?: Message | null;
  unreadCount: number;
};

type ConversationDetail = ConversationSummary & {
  messages: Message[];
};

export default function MessagesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string>();
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [error, setError] = useState<string>();
  const [isFetching, setIsFetching] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedConversationId),
    [conversations, selectedConversationId],
  );

  const loadConversations = useCallback(async () => {
    const response = await fetch('/api/conversations', { cache: 'no-store' });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Chargement des conversations impossible');
    }

    setConversations(data.conversations);

    return data.conversations as ConversationSummary[];
  }, []);

  const startConversation = useCallback(async (participantId: string) => {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Conversation impossible');
    }

    setSelectedConversationId(data.conversation.id);
    router.replace(`/messages?conversationId=${data.conversation.id}`);
    return data.conversation as ConversationSummary;
  }, [router]);

  useEffect(() => {
    async function initializeMessages() {
      if (!isAuthenticated) {
        if (!isLoading) {
          setIsFetching(false);
        }
        return;
      }

      try {
        setIsFetching(true);
        setError(undefined);
        const params = new URLSearchParams(window.location.search);
        const userId = params.get('userId');
        const conversationId = params.get('conversationId');

        let loadedConversations = await loadConversations();

        if (userId) {
          const startedConversation = await startConversation(userId);
          loadedConversations = await loadConversations();
          setSelectedConversationId(startedConversation.id);
        } else if (conversationId) {
          setSelectedConversationId(conversationId);
        } else if (loadedConversations[0]) {
          setSelectedConversationId(loadedConversations[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chargement impossible');
      } finally {
        setIsFetching(false);
      }
    }

    void initializeMessages();
  }, [isAuthenticated, isLoading, loadConversations, startConversation]);

  useEffect(() => {
    async function loadConversation() {
      if (!selectedConversationId) {
        setConversation(null);
        return;
      }

      try {
        setError(undefined);
        const response = await fetch(`/api/conversations/${selectedConversationId}`, {
          cache: 'no-store',
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Conversation introuvable');
        }

        setConversation(data.conversation);
        await fetch(`/api/conversations/${selectedConversationId}`, { method: 'PATCH' });
        setConversations((current) =>
          current.map((item) =>
            item.id === selectedConversationId ? { ...item, unreadCount: 0 } : item,
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Conversation introuvable');
      }
    }

    void loadConversation();
  }, [selectedConversationId]);

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedConversationId || !messageContent.trim()) {
      return;
    }

    try {
      setIsSending(true);
      setError(undefined);
      const response = await fetch(`/api/conversations/${selectedConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Envoi impossible');
      }

      setMessageContent('');
      setConversation((current) =>
        current ? { ...current, messages: [...current.messages, data.message] } : current,
      );
      await loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible');
    } finally {
      setIsSending(false);
    }
  };

  if (!isLoading && !isAuthenticated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Connectez-vous pour accéder aux messages</h1>
        <p className="mt-4 text-slate-600">Échangez directement avec les professionnels du réseau.</p>
        <Link
          href="/login"
          className="mt-8 inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">Messages</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Messagerie privée</h1>
      </div>

      {error && <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid min-h-[620px] gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-3xl bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-slate-900">Conversations</h2>
          <div className="mt-4 space-y-3">
            {isFetching ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Chargement...</p>
            ) : conversations.length > 0 ? (
              conversations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedConversationId(item.id);
                    router.replace(`/messages?conversationId=${item.id}`);
                  }}
                  className={`w-full rounded-2xl p-4 text-left transition ${
                    selectedConversationId === item.id
                      ? 'bg-blue-50 ring-1 ring-blue-100'
                      : 'bg-slate-50 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.otherParticipant.firstName} {item.otherParticipant.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.otherParticipant.title || 'Professionnel IT'}
                      </p>
                    </div>
                    {item.unreadCount > 0 && (
                      <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                        {item.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                    {item.lastMessage?.content || 'Aucun message pour le moment.'}
                  </p>
                </button>
              ))
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                Aucune conversation. Ouvrez un profil et cliquez sur Contacter.
              </p>
            )}
          </div>
        </aside>

        <section className="flex rounded-3xl bg-white shadow-soft">
          {conversation || selectedConversation ? (
            <div className="flex min-h-full w-full flex-col">
              <header className="border-b border-slate-100 p-5">
                <Link
                  href={`/profile/${(conversation || selectedConversation)!.otherParticipant.username}`}
                  className="text-xl font-bold text-slate-900 hover:text-blue-700"
                >
                  {(conversation || selectedConversation)!.otherParticipant.firstName}{' '}
                  {(conversation || selectedConversation)!.otherParticipant.lastName}
                </Link>
                <p className="text-sm text-slate-500">
                  {(conversation || selectedConversation)!.otherParticipant.title || 'Professionnel IT'}
                </p>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {conversation?.messages.length ? (
                  conversation.messages.map((message) => {
                    const mine = message.senderId === user?.id;
                    return (
                      <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] rounded-3xl px-5 py-3 ${
                            mine ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                          <p className={`mt-2 text-xs ${mine ? 'text-blue-100' : 'text-slate-500'}`}>
                            {formatDate(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Aucun message. Lancez la discussion.
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="border-t border-slate-100 p-5">
                <div className="flex gap-3">
                  <textarea
                    value={messageContent}
                    onChange={(event) => setMessageContent(event.target.value)}
                    rows={2}
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500"
                    placeholder="Écrire un message..."
                  />
                  <button
                    type="submit"
                    disabled={isSending || !messageContent.trim()}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex w-full items-center justify-center p-8 text-center text-slate-500">
              Sélectionnez une conversation pour commencer.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

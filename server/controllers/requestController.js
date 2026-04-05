const { db } = require('../config/db');
const { requests, exchanges, conversations, conversationParticipants, notifications, users, bids } = require('../db/schema/index');
const { eq, and, desc } = require('drizzle-orm');

// @route POST /api/requests
const sendRequest = async (req, res) => {
  try {
    const { bidId, receiverId, message } = req.body;

    // Duplicate check
    const [existing] = await db.select().from(requests)
      .where(and(eq(requests.senderId, req.user.id), eq(requests.bidId, bidId), eq(requests.status, 'pending')));
    if (existing) return res.status(400).json({ message: 'You already sent a request for this bid' });

    const [request] = await db.insert(requests)
      .values({ senderId: req.user.id, receiverId, bidId, message })
      .returning();

    // Notification
    await db.insert(notifications).values({
      userId: receiverId,
      type: 'request',
      message: `${req.user.name} sent you a skill exchange request`,
      link: `/requests/${request.id}`,
    });

    req.io.to(receiverId).emit('new_notification', { type: 'request', message: `${req.user.name} sent you a request!` });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/requests/received
const getReceivedRequests = async (req, res) => {
  try {
    const received = await db
      .select({
        id: requests.id, message: requests.message, status: requests.status, createdAt: requests.createdAt,
        sender: { id: users.id, name: users.name, avatar: users.avatar },
        bid: { id: bids.id, skillOffered: bids.skillOffered, skillWanted: bids.skillWanted },
      })
      .from(requests)
      .innerJoin(users, eq(requests.senderId, users.id))
      .innerJoin(bids, eq(requests.bidId, bids.id))
      .where(eq(requests.receiverId, req.user.id))
      .orderBy(desc(requests.createdAt));

    res.json(received);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/requests/sent
const getSentRequests = async (req, res) => {
  try {
    const sent = await db
      .select({
        id: requests.id, message: requests.message, status: requests.status, createdAt: requests.createdAt,
        receiver: { id: users.id, name: users.name, avatar: users.avatar },
        bid: { id: bids.id, skillOffered: bids.skillOffered, skillWanted: bids.skillWanted },
      })
      .from(requests)
      .innerJoin(users, eq(requests.receiverId, users.id))
      .innerJoin(bids, eq(requests.bidId, bids.id))
      .where(eq(requests.senderId, req.user.id))
      .orderBy(desc(requests.createdAt));

    res.json(sent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/requests/:id/accept
const acceptRequest = async (req, res) => {
  try {
    const [request] = await db.select().from(requests).where(eq(requests.id, req.params.id));
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.receiverId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    await db.update(requests).set({ status: 'accepted', updatedAt: new Date() }).where(eq(requests.id, request.id));

    // Create exchange
    const [exchange] = await db.insert(exchanges)
      .values({ userAId: request.senderId, userBId: request.receiverId, bidId: request.bidId, requestId: request.id })
      .returning();

    // Create conversation
    const [conv] = await db.insert(conversations)
      .values({ exchangeId: exchange.id })
      .returning();

    // Add participants
    await db.insert(conversationParticipants).values([
      { conversationId: conv.id, userId: request.senderId },
      { conversationId: conv.id, userId: request.receiverId },
    ]);

    // Notify sender
    await db.insert(notifications).values({
      userId: request.senderId,
      type: 'exchange',
      message: 'Your request was accepted! Exchange created.',
      link: `/exchanges/${exchange.id}`,
    });

    req.io.to(request.senderId).emit('new_notification', { type: 'exchange_created', exchangeId: exchange.id });

    res.json({ message: 'Request accepted', exchange });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/requests/:id/reject
const rejectRequest = async (req, res) => {
  try {
    const [request] = await db.select().from(requests).where(eq(requests.id, req.params.id));
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.receiverId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await db.update(requests).set({ status: 'rejected', updatedAt: new Date() }).where(eq(requests.id, request.id));

    await db.insert(notifications).values({
      userId: request.senderId,
      type: 'request',
      message: 'Your exchange request was declined.',
    });

    res.json({ message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendRequest, getReceivedRequests, getSentRequests, acceptRequest, rejectRequest };
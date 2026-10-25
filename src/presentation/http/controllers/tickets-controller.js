export class TicketsController {
  constructor({
    createTicketUseCase,
    listTicketsUseCase,
    getTicketByIdUseCase,
    updateTicketUseCase,
    assignTicketUseCase,
    changeTicketStatusUseCase,
    createCommentUseCase,
    listCommentsUseCase,
    listTicketEventsUseCase,
  }) {
    this.createTicketUseCase = createTicketUseCase;
    this.listTicketsUseCase = listTicketsUseCase;
    this.getTicketByIdUseCase = getTicketByIdUseCase;
    this.updateTicketUseCase = updateTicketUseCase;
    this.assignTicketUseCase = assignTicketUseCase;
    this.changeTicketStatusUseCase = changeTicketStatusUseCase;
    this.createCommentUseCase = createCommentUseCase;
    this.listCommentsUseCase = listCommentsUseCase;
    this.listTicketEventsUseCase = listTicketEventsUseCase;
  }

  create = async (req, res, next) => {
    try {
      const { title, description, priority, categoryId, dueDate } = req.body;
      const ticket = await this.createTicketUseCase.execute({
        title,
        description,
        priority,
        categoryId,
        dueDate,
        requesterId: req.user.id,
      });
      return res.status(201).json(ticket);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const query = req.validated?.query || req.query || {};
      const result = await this.listTicketsUseCase.execute({
        user: req.user,
        ...query,
      });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const ticket = await this.getTicketByIdUseCase.execute({ id, user: req.user });
      return res.status(200).json(ticket);
    } catch (error) {
      return next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, description, priority, categoryId, dueDate } = req.body;
      const ticket = await this.updateTicketUseCase.execute({
        id,
        user: req.user,
        title,
        description,
        priority,
        categoryId,
        dueDate,
      });
      return res.status(200).json(ticket);
    } catch (error) {
      return next(error);
    }
  };

  assign = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { assignedUserId } = req.body;
      const ticket = await this.assignTicketUseCase.execute({
        id,
        actorUser: req.user,
        assignedUserId,
      });
      return res.status(200).json(ticket);
    } catch (error) {
      return next(error);
    }
  };

  changeStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const ticket = await this.changeTicketStatusUseCase.execute({
        id,
        actorUser: req.user,
        status,
      });
      return res.status(200).json(ticket);
    } catch (error) {
      return next(error);
    }
  };

  createComment = async (req, res, next) => {
    try {
      const { ticketId } = req.params;
      const { content } = req.body;
      const comment = await this.createCommentUseCase.execute({
        ticketId,
        user: req.user,
        content,
      });
      return res.status(201).json(comment);
    } catch (error) {
      return next(error);
    }
  };

  listComments = async (req, res, next) => {
    try {
      const { ticketId } = req.params;
      const comments = await this.listCommentsUseCase.execute({
        ticketId,
        user: req.user,
      });
      return res.status(200).json(comments);
    } catch (error) {
      return next(error);
    }
  };

  listEvents = async (req, res, next) => {
    try {
      const { ticketId } = req.params;
      const events = await this.listTicketEventsUseCase.execute({
        ticketId,
        user: req.user,
      });
      return res.status(200).json(events);
    } catch (error) {
      return next(error);
    }
  };
}

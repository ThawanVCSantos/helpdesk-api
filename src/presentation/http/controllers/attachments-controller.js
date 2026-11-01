export class AttachmentsController {
  constructor({
    uploadTicketAttachment,
    uploadCommentAttachment,
    listTicketAttachments,
    listCommentAttachments,
    deleteAttachment,
  }) {
    this.uploadTicketAttachment = uploadTicketAttachment;
    this.uploadCommentAttachment = uploadCommentAttachment;
    this.listTicketAttachments = listTicketAttachments;
    this.listCommentAttachments = listCommentAttachments;
    this.deleteAttachment = deleteAttachment;
  }

  uploadTicket = async (req, res, next) => {
    try {
      const { ticketId } = req.params;
      const file = req.file;
      const user = req.user;

      const result = await this.uploadTicketAttachment.execute({
        ticketId,
        user,
        file,
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  uploadComment = async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const file = req.file;
      const user = req.user;

      const result = await this.uploadCommentAttachment.execute({
        commentId,
        user,
        file,
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listByTicket = async (req, res, next) => {
    try {
      const { ticketId } = req.params;
      const user = req.user;

      const result = await this.listTicketAttachments.execute({
        ticketId,
        user,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listByComment = async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const user = req.user;

      const result = await this.listCommentAttachments.execute({
        commentId,
        user,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;

      await this.deleteAttachment.execute({
        attachmentId: id,
        user,
      });

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export class Post {
  private id?: string;
  public creatorId: string;
  public creatorEmail: string;
  public comments?: string;
  public imageName: string;
  public imageURL: string;
  public creationDate?: Date;

  constructor(post: {
    id?: string;
    creatorId: string;
    creatorEmail: string;
    comments?: string;
    imageName: string;
    imageURL: string;
    creationDate?: Date;
  }) {
    this.id = post.id;
    this.creatorId = post.creatorId;
    this.creatorEmail = post.creatorEmail;
    this.comments = post.comments;
    this.imageName = post.imageName;
    this.imageURL = post.imageURL;
    this.creationDate = post.creationDate;
  }

  getId(): string {
    return this.id ? this.id : 'N/A';
  }

  static fromMongooseDocument(doc: any): Post {
    return new Post({
      id: doc._id.toString(),
      creatorId: doc.creatorId,
      creatorEmail: doc.creatorEmail,
      comments: doc.comments,
      imageName: doc.imageName,
      imageURL: doc.imageURL,
      creationDate: doc.creationDate,
    });
  }
}

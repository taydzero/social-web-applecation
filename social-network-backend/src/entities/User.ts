import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Message } from "./Message";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 255 })
    name!: string;

    @Column({ length: 255, unique: true })
    email!: string;

    @Column({ length: 255 })
    password!: string;

    @Column({ type: 'text', nullable: true })
    bio?: string;

    @Column({ length: 255, nullable: true })
    avatar?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @OneToMany(() => Message, message => message.fromUser)
    messagesSent!: Message[];

    @OneToMany(() => Message, message => message.toUser)
    messagesReceived!: Message[];
}

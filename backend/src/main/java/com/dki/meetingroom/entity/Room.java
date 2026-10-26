package com.dki.meetingroom.entity;
import jakarta.persistence.*;
@Entity @Table(name="rooms")
public class Room {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false,unique=true,length=120) public String name;
 @Column(nullable=false) public int capacity;
 @Column(nullable=false,length=160) public String location;
 @Column(nullable=false) public boolean active=true;
 public Room(){}
 public Room(String name,int capacity,String location,boolean active){this.name=name;this.capacity=capacity;this.location=location;this.active=active;}
}

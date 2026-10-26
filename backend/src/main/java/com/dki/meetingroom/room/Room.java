package com.dki.meetingroom.room;
import jakarta.persistence.*;
@Entity @Table(name="rooms")
public class Room {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false,unique=true) public String name;
 public int capacity;
 public String location;
 public boolean active=true;
 public Room(){}
 public Room(String name,int capacity,String location,boolean active){this.name=name;this.capacity=capacity;this.location=location;this.active=active;}
}

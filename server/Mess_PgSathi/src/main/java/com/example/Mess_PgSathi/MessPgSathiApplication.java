package com.example.Mess_PgSathi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MessPgSathiApplication {

	public static void main(String[] args) {
		SpringApplication.run(MessPgSathiApplication.class, args);
	}

}

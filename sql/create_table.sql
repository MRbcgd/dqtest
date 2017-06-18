CREATE TABLE IF NOT EXISTS `server_monitoring`.`agentinfo` (
  `svrkey` VARCHAR(32) NOT NULL,
  `hostnm` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`svrkey`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS `server_monitoring`.`agenttcp` (
  `svrkey` VARCHAR(32) NOT NULL,
  `idate` DATETIME NOT NULL,
  `eth` VARCHAR(16) NOT NULL,
  `rcv` INT(11) NULL DEFAULT NULL,
  `snd` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`svrkey`, `idate`, `eth`),
  INDEX `fk_table1_AgentInfo4` (`svrkey` ASC),
  CONSTRAINT `fk_table1_AgentInfo4`
    FOREIGN KEY (`svrkey`)
    REFERENCES `server_monitoring`.`agentinfo` (`svrkey`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS `server_monitoring`.`agentdisk` (
  `svrkey` VARCHAR(32) NOT NULL,
  `idate` DATETIME NOT NULL,
  `mount` VARCHAR(128) NOT NULL,
  `total` INT(11) NULL DEFAULT NULL,
  `used` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`svrkey`, `idate`, `mount`),
  INDEX `fk_table1_AgentInfo3` (`svrkey` ASC),
  CONSTRAINT `fk_table1_AgentInfo3`
    FOREIGN KEY (`svrkey`)
    REFERENCES `server_monitoring`.`agentinfo` (`svrkey`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS `server_monitoring`.`agentipcq` (
  `svrkey` VARCHAR(32) NOT NULL,
  `idate` DATETIME NOT NULL,
  `qkey` INT(11) NOT NULL,
  `qid` INT(11) NULL DEFAULT NULL,
  `qnum` INT(11) NULL DEFAULT NULL,
  `qbytes` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`svrkey`, `idate`, `qkey`),
  INDEX `fk_table1_AgentInfo5` (`svrkey` ASC),
  CONSTRAINT `fk_table1_AgentInfo5`
    FOREIGN KEY (`svrkey`)
    REFERENCES `server_monitoring`.`agentinfo` (`svrkey`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS `server_monitoring`.`agentcpu` (
  `svrkey` VARCHAR(32) NOT NULL,
  `idate` DATETIME NOT NULL,
  `us` INT(11) NOT NULL,
  `prcs1_nm` VARCHAR(32) NOT NULL,
  `prcs1_us` INT(11) NOT NULL,
  `prcs2_nm` VARCHAR(32) NOT NULL,
  `prcs2_us` INT(11) NOT NULL,
  `prcs3_nm` VARCHAR(32) NOT NULL,
  `prcs3_us` INT(11) NOT NULL,
  PRIMARY KEY (`svrkey`, `idate`),
  INDEX `fk_AgentMemory_AgentInfo1_idx` (`svrkey` ASC),
  CONSTRAINT `fk_AgentMemory_AgentInfo1`
    FOREIGN KEY (`svrkey`)
    REFERENCES `server_monitoring`.`agentinfo` (`svrkey`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS `server_monitoring`.`agentmemory` (
  `svrkey` VARCHAR(32) NOT NULL,
  `idate` DATETIME NOT NULL,
  `us` INT(11) NULL DEFAULT NULL,
  `swap` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`svrkey`, `idate`),
  INDEX `fk_table1_AgentInfo2` (`svrkey` ASC),
  CONSTRAINT `fk_table1_AgentInfo2`
    FOREIGN KEY (`svrkey`)
    REFERENCES `server_monitoring`.`agentinfo` (`svrkey`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

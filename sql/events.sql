SET GLOBAL event_scheduler = ON;

DELIMITER //
CREATE EVENT del_agentcpu
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
ENABLE
DO
BEGIN
DELETE FROM server_monitoring.agentcpu
WHERE idate < DATE_SUB(CURDATE(), INTERVAL 3 MONTH);
END //;

DELIMITER //
CREATE EVENT del_agenttcp
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
ENABLE
DO
BEGIN
DELETE FROM server_monitoring.agenttcp
WHERE idate < DATE_SUB(CURDATE(), INTERVAL 3 MONTH);
END //;

DELIMITER //
CREATE EVENT del_agentdisk
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
ENABLE
DO
BEGIN
DELETE FROM server_monitoring.agentdisk
WHERE idate < DATE_SUB(CURDATE(), INTERVAL 3 MONTH);
END //;

DELIMITER //
CREATE EVENT del_agentmemory
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
ENABLE
DO
BEGIN
DELETE FROM server_monitoring.agentmemory
WHERE idate < DATE_SUB(CURDATE(), INTERVAL 3 MONTH);
END //;

DELIMITER //
CREATE EVENT del_agentipcq
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
ENABLE
DO
BEGIN
DELETE FROM server_monitoring.agentipcq
WHERE idate < DATE_SUB(CURDATE(), INTERVAL 3 MONTH);
END //

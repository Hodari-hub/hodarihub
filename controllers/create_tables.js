const conn=require("../modals/connection");
var create_tables=()=>{
    
    //here we save all member details in the database
    conn.query(`CREATE TABLE IF NOT EXISTS base_members(
                m_id INT(11) NOT NULL AUTO_INCREMENT, m_pic TEXT NULL, 
                m_name TEXT NOT NULL,m_location TEXT NOT NULL,m_description TEXT NOT NULL,
                m_phone_number VARCHAR(255) NULL, m_sec_number VARCHAR(255) NULL,
                m_email VARCHAR(255) NOT NULL,  m_pass VARCHAR(255) NOT NULL,
                m_type ENUM('member','operator','admin') NOT NULL,
                created_by INT(11) NOT NULL, date_created DATETIME NULL,
                last_log DATETIME NULL, PRIMARY KEY(m_id)
            )`, 
        function (error, result) {if (error) throw error;});
    
    //this save the position of each member in hub
    conn.query(`CREATE TABLE IF NOT EXISTS positions(p_id INTEGER PRIMARY KEY AUTO_INCREMENT,m_id INT(11) NOT NULL,
                positions TEXT NOT NULL, descriptions TEXT NOT NULL)`,
            function (error, result) {if (error) throw error;});

    //save all hub bot
    conn.query(`CREATE TABLE IF NOT EXISTS bots(
        bot_id INT(11) NOT NULL AUTO_INCREMENT,owner_id INT(11) NOT NULL,bot_name TEXT NULL, 
        medianame VARCHAR(255) NOT NULL, media_address TEXT NOT NULL, description TEXT NOT NULL,
        bot_phone VARCHAR(255) NULL, api_key TEXT NULL, apisecret TEXT NULL, access_token TEXT NULL,
        access_secret TEXT NULL, baretoken LONGTEXT NULL, media_password VARCHAR(255) NOT NULL, created_by INT(11) NOT NULL, 
        date_created DATETIME NULL,  PRIMARY KEY(bot_id)
    )`,function (error, result) {if (error) throw error;});

    //save all hub emails
    conn.query(`CREATE TABLE IF NOT EXISTS emails(
            mail_id INT(11) NOT NULL AUTO_INCREMENT, owner_id INT(11) NOT NULL,
            f_name TEXT NULL,mailtype VARCHAR(255) NOT NULL, mail_address TEXT NOT NULL,
            primary_address TEXT NOT NULL,mail_phone VARCHAR(255) NULL,password TEXT NOT NULL,
            created_by INT(11) NOT NULL,date_created DATETIME NULL,PRIMARY KEY(mail_id)
        )`,function (error, result) {if (error) throw error;});
    
    //this hold all keywords and the bot to listen     
    conn.query(`CREATE TABLE IF NOT EXISTS key_bystander(
            key_id INT(11) NOT NULL AUTO_INCREMENT,bot_id INT(11) NOT NULL,owner_id INT(11) NOT NULL,keyword TEXT NULL,PRIMARY KEY(key_id)
        )`,function (error, result) {if (error) throw error;});

        conn.query(`CREATE TABLE IF NOT EXISTS daily_tone(key_id INT(11) NOT NULL AUTO_INCREMENT,
            key_word VARCHAR(255) NOT NULL, user_id INT(11) NOT NULL, media VARCHAR(255) NOT NULL,
            date_created DATETIME NULL,PRIMARY KEY(key_id)
        )`,function (error, result) {if (error) throw error;});

        conn.query(`CREATE TABLE IF NOT EXISTS daily_tonality(
            t_id INT(11) NOT NULL AUTO_INCREMENT, key_id INT(11) NOT NULL,
            content_id INT(11) NOT NULL, positive INT(11) NOT NULL,
            negative INT(11) NOT NULL, neutral INT(11) NOT NULL,
            unrelated INT(11) NOT NULL, date_created DATETIME NULL,
            PRIMARY KEY(t_id)
        )`,function (error, result) {if (error) throw error;});

        conn.query(`CREATE TABLE IF NOT EXISTS retweet_from_specific(
            ky_id INT(11) NOT NULL AUTO_INCREMENT,user_id INT(11) NOT NULL,bot_id INT(11) NOT NULL,
            from_author_id VARCHAR(255) NOT NULL,from_author_name VARCHAR(255) NOT NULL,keyword TEXT NOT NULL,date_created DATETIME NULL,PRIMARY KEY(ky_id)
        )`,function (error, result) {if (error) throw error;});

        conn.query(`CREATE TABLE IF NOT EXISTS social_media(media_id INT(11) NOT NULL AUTO_INCREMENT, user_id INT(11) NOT NULL,
            page_name TEXT NOT NULL,media_name VARCHAR(255) NOT NULL,PRIMARY KEY(media_id)
        )`,function (error, result) {if (error) throw error;});

        conn.query(`CREATE TABLE IF NOT EXISTS message_trend(
            messageid INT(11) NOT NULL AUTO_INCREMENT, user_id INT(11) NOT NULL,
            dm_message VARCHAR(255) NOT NULL, messanger VARCHAR(255) NOT NULL,
            datemade DATE NOT NULL,  PRIMARY KEY(messageid)
        )`,function (error, result) {if (error) throw error;});

        conn.query(`CREATE TABLE IF NOT EXISTS tonality(
            t_id INT(11) NOT NULL AUTO_INCREMENT,u_id INT(11) NOT NULL, 
            media_type VARCHAR(255) NOT NULL, page_id INT(11) NOT NULL,
            link VARCHAR(255) NOT NULL, positive VARCHAR(255) NOT NULL, negative VARCHAR(255) NOT NULL, 
            neautral VARCHAR(255) NOT NULL,unrelated VARCHAR(255) NOT NULL, total INT NOT NULL,
            date_created DATETIME NULL, PRIMARY KEY(t_id)
        )`,function (error, result) {if (error) throw error;});
}

module.exports={create_tables};
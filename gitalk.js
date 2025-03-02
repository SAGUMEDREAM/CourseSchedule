const gitalk = new Gitalk({
    clientID: 'Ov23liQp6AvYWn6JClCN',
    clientSecret: 'c554344fa4aca79c8c1718daadb2513f672045ee',
    repo: 'CourseSchedule',      // The repository of store comments,
    owner: 'SAGUMEDREAM',
    admin: ['SAGUMEDREAM'],
    id: location.pathname,      // Ensure uniqueness and length less than 50
    distractionFreeMode: false  // Facebook-like distraction free mode
})

gitalk.render('gitalk-container')
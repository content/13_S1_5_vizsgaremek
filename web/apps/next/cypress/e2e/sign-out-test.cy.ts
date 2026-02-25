it('login', function() {
    cy.visit('http://localhost:3000/login')
    
    cy.get('#email').click();
    cy.get('#email').type('adamvad@gmail.com');
    cy.get('#password').type('qweQWE123!');
    cy.get('button.w-full').click();

    cy.get('span.rounded-full.bg-primary\\/10').click();
    cy.get('a').contains('Kijelentkezés').click();
    
    cy.url().should('include', '/login');
    
});
describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  });

  it('course', function() {
    cy.visit('http://localhost:3000/login')
    
    cy.get('#email').click();
    cy.get('#email').type('adamvad@gmail.com');
    cy.get('#password').type('qweQWE123!');
    cy.get('button.w-full').click();
    cy.get('#course-name').type('Matematika2222');
    cy.get('#radix-«rd» div.border').click();
    cy.get('#radix-«rd» button.bg-primary').click();
    cy.get('a[href="/dashboard/4"]').click(); //Lehet cserelni kell majd


      })
  });